import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserService } from "../services/UserService";
import { loginBodySchema, LoginBody } from "../schemas/userSchema";
import { prisma } from "../lib/prisma";
import { sendResetPasswordEmail } from "../services/mail";
import { logger } from "../lib/logger";
import { createHash, timingSafeEqual, randomUUID } from "crypto";

import { AccountAttemptLimiter } from "../lib/requestSecurity";

const userService = new UserService();
const isProduction = process.env.NODE_ENV === "production";
const LOGIN_PROXY_SECRET = process.env.LOGIN_PROXY_SECRET?.trim();
const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  signed: false,
} as const;

const DISABLED_USER_TYPE = "D";
const PASSWORD_MIN_LENGTH = 12;
const INVALID_CREDENTIALS = "Credenciais invalidas.";
// Match the slow path for unknown/uninitialized accounts without using a real credential.
const DUMMY_PASSWORD_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const resetClaimsSchema = z.object({
  purpose: z.literal("password-reset"), email: z.string().email().max(254),
  tipoAcesso: z.enum(["USUARIO", "APRENDIZ", "EDUCADOR", "EMPRESA"]),
  resetSubject: z.string().min(1).max(128), passwordFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});

const USER_TOKEN_TYPES: Record<string, string> = {
  A: "USUARIO_ADMINISTRADOR",
  P: "USUARIO_PEDAGOGICO",
  C: "USUARIO_RECEPCAO",
  T: "USUARIO_TECNICO",
  E: "USUARIO_EMPRESARIAL",
  S: "USUARIO_PESQUISA",
};
const PASSWORD_RESET_ACCESS_TYPES = ["USUARIO", "APRENDIZ", "EDUCADOR", "EMPRESA"] as const;
type PasswordResetAccessType = (typeof PASSWORD_RESET_ACCESS_TYPES)[number];
type PasswordResetTarget = {
  email: string;
  tipoAcesso: PasswordResetAccessType;
  resetSubject: string;
  passwordHash?: string | null;
};

function passwordResetFingerprint(passwordHash?: string | null) {
  return createHash("sha256")
    .update((passwordHash ?? "NO_PASSWORD").trim())
    .digest("hex");
}

function normalizeUserType(type?: string | null) {
  return (type ?? "").trim().toUpperCase();
}

function getUserTokenType(type: string) {
  return USER_TOKEN_TYPES[type] ?? `USUARIO_${type || "SEM_TIPO"}`;
}

function logAuthRateLimit(request: any) {
  request.log.warn(
    {
      event: "auth_rate_limited",
      ip: request.ip,
      route: request.url,
      userAgent: request.headers["user-agent"],
    },
    "Auth route rate limited",
  );
}

function authRateLimit(max: number, timeWindow = "15 minutes") {
  return {
    max,
    timeWindow,
    continueExceeding: true,
    errorResponseBuilder: (_request: unknown, context: { statusCode: number }) => ({
      statusCode: context.statusCode,
      message: "Muitas tentativas. Tente novamente mais tarde.",
    }),
    onExceeded: (request: any) => logAuthRateLimit(request),
  };
}

function safeSecretMatch(value: string, expected: string) {
  const actual = Buffer.from(value);
  const target = Buffer.from(expected);
  return actual.length === target.length && timingSafeEqual(actual, target);
}

function hasLoginProxySecret(request: FastifyRequest) {
  if (!LOGIN_PROXY_SECRET) return false;
  const providedSecret = request.headers["x-prosis-login-secret"];
  return (
    typeof providedSecret === "string" &&
    safeSecretMatch(providedSecret, LOGIN_PROXY_SECRET)
  );
}

function parsePositiveSafeInteger(value?: string) {
  if (!value) return null;
  const numericValue = Number(value);
  if (!Number.isSafeInteger(numericValue) || numericValue <= 0) return null;
  return numericValue;
}

function parsePositiveBigInt(value?: string) {
  if (!value || !/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

async function findPasswordResetTarget(
  email: string,
  tipoAcesso: PasswordResetAccessType,
): Promise<PasswordResetTarget | null> {
  if (tipoAcesso === "USUARIO") {
    const user = await (prisma as any).cA_Usuarios.findFirst({
      where: { UsuEmail: email },
      select: { UsuCodigo: true, UsuEmail: true, UsuSenha: true },
    });
    if (!user?.UsuEmail) return null;
    return {
      email: user.UsuEmail,
      tipoAcesso,
      resetSubject: String(user.UsuCodigo),
      passwordHash: user.UsuSenha,
    };
  }

  if (tipoAcesso === "APRENDIZ") {
    const aprendiz = await prisma.cA_Aprendiz.findFirst({
      where: { Apr_Email: email },
      select: { Apr_Codigo: true, Apr_Email: true, Apr_senha: true },
    });
    if (!aprendiz?.Apr_Email) return null;
    return {
      email: aprendiz.Apr_Email,
      tipoAcesso,
      resetSubject: String(aprendiz.Apr_Codigo),
      passwordHash: aprendiz.Apr_senha,
    };
  }

  if (tipoAcesso === "EDUCADOR") {
    const educador = await prisma.cA_Educadores.findFirst({
      where: { EducEMail: email },
      select: { EducCodigo: true, EducEMail: true, EducSenha: true },
    });
    if (!educador?.EducEMail) return null;
    return {
      email: educador.EducEMail,
      tipoAcesso,
      resetSubject: String(educador.EducCodigo),
      passwordHash: educador.EducSenha,
    };
  }

  const empresa = await prisma.cA_Parceiros.findFirst({
    where: { ParEmail: email },
    select: { ParCodigo: true, ParEmail: true, ParSenha: true },
  });
  if (!empresa?.ParEmail) return null;
  return {
    email: empresa.ParEmail,
    tipoAcesso,
    resetSubject: String(empresa.ParCodigo),
    passwordHash: empresa.ParSenha,
  };
}

async function findCurrentPasswordHash(params: {
  email: string;
  tipoAcesso: PasswordResetAccessType;
  resetSubject?: string;
}) {
  const { email, tipoAcesso, resetSubject } = params;

  if (tipoAcesso === "USUARIO") {
    const user = resetSubject
      ? await (prisma as any).cA_Usuarios.findUnique({
          where: { UsuCodigo: resetSubject },
          select: { UsuSenha: true },
        })
      : await (prisma as any).cA_Usuarios.findFirst({
          where: { UsuEmail: email },
          select: { UsuSenha: true },
        });
    return user?.UsuSenha ?? null;
  }

  if (tipoAcesso === "APRENDIZ") {
    const aprendizCode = parsePositiveBigInt(resetSubject);
    const aprendiz = aprendizCode
      ? await prisma.cA_Aprendiz.findUnique({
          where: { Apr_Codigo: aprendizCode },
          select: { Apr_senha: true },
        })
      : await prisma.cA_Aprendiz.findFirst({
          where: { Apr_Email: email },
          select: { Apr_senha: true },
        });
    return aprendiz?.Apr_senha ?? null;
  }

  if (tipoAcesso === "EDUCADOR") {
    const educadorCode = parsePositiveSafeInteger(resetSubject);
    const educador = educadorCode
      ? await prisma.cA_Educadores.findUnique({
          where: { EducCodigo: educadorCode },
          select: { EducSenha: true },
        })
      : await prisma.cA_Educadores.findFirst({
          where: { EducEMail: email },
          select: { EducSenha: true },
        });
    return educador?.EducSenha ?? null;
  }

  const empresaCode = parsePositiveSafeInteger(resetSubject);
  const empresa = empresaCode
    ? await prisma.cA_Parceiros.findUnique({
        where: { ParCodigo: empresaCode },
        select: { ParSenha: true },
      })
    : await prisma.cA_Parceiros.findFirst({
        where: { ParEmail: email },
        select: { ParSenha: true },
      });
  return empresa?.ParSenha ?? null;
}

async function updatePasswordResetTarget(params: {
  tipoAcesso: PasswordResetAccessType;
  resetSubject: string;
  previousPasswordHash: string | null;
  hashedPassword: string;
}) {
  const { tipoAcesso, resetSubject, previousPasswordHash, hashedPassword } = params;
  if (tipoAcesso === "USUARIO") {
    if (previousPasswordHash === null) return false;
    const result = await prisma.cA_Usuarios.updateMany({
      where: { UsuCodigo: resetSubject, UsuSenha: previousPasswordHash }, data: { UsuSenha: hashedPassword },
    });
    return result.count === 1;
  }
  if (tipoAcesso === "APRENDIZ") {
    const id = parsePositiveBigInt(resetSubject);
    if (!id) return false;
    const result = await prisma.cA_Aprendiz.updateMany({
      where: { Apr_Codigo: id, Apr_senha: previousPasswordHash }, data: { Apr_senha: hashedPassword },
    });
    return result.count === 1;
  }
  if (tipoAcesso === "EDUCADOR") {
    const id = parsePositiveSafeInteger(resetSubject);
    if (!id) return false;
    const result = await prisma.cA_Educadores.updateMany({
      where: { EducCodigo: id, EducSenha: previousPasswordHash }, data: { EducSenha: hashedPassword },
    });
    return result.count === 1;
  }
  const id = parsePositiveSafeInteger(resetSubject);
  if (!id) return false;
  const result = await prisma.cA_Parceiros.updateMany({
    where: { ParCodigo: id, ParSenha: previousPasswordHash }, data: { ParSenha: hashedPassword },
  });
  return result.count === 1;
}

export async function authRoutes(app: FastifyInstance) {
  const accountLimiter = new AccountAttemptLimiter();
  function limitAccount(request: FastifyRequest, reply: FastifyReply, identifier: string, max: number, windowMs: number) {
    const body = request.body as { tipoAcesso?: string };
    const scope = request.url.startsWith("/login") ? "login" : "recovery";
    const normalizedIdentifier = scope === "login" && body.tipoAcesso !== "USUARIO"
      ? identifier.replace(/\D/g, "") || identifier
      : identifier;
    const retryAfter = accountLimiter.consume(scope + ":" + (body.tipoAcesso ?? "USUARIO"), normalizedIdentifier, max, windowMs);
    if (!retryAfter) return false;
    reply.header("Retry-After", retryAfter).code(429).send({ message: "Muitas tentativas. Tente novamente mais tarde." });
    return true;
  }
  async function rejectCredentials(senha: string, reply: FastifyReply) {
    await bcrypt.compare(senha, DUMMY_PASSWORD_HASH);
    return reply.status(401).send({ message: INVALID_CREDENTIALS });
  }

  app.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      config: {
        rateLimit: {
          ...authRateLimit(5),
          // The embedded Next transport has no verified client socket. Do not lock
          // every user behind its loopback address after five total attempts.
          keyGenerator: (request: FastifyRequest) => hasLoginProxySecret(request) ? "trusted-login-proxy" : request.ip,
          max: (request: FastifyRequest) => hasLoginProxySecret(request) ? 300 : 5,
          timeWindow: (request: FastifyRequest) => hasLoginProxySecret(request) ? 60_000 : 15 * 60_000,
        },
      },
      schema: {
        tags: ["Autenticação"],
        summary: "Login do usuário",
        body: loginBodySchema,
        response: {
          200: z.object({
            message: z.string(),
            token: z.string(),
            user: z.object({
              UsuCodigo: z.string(),
              UsuNome: z.string(),
              UsuEmail: z.string().nullable().optional(),
              UsuTipo: z.string().nullable().optional(),
              TokenTipo: z.string(),
              TipoAcesso: z.string(),
            }),
          }),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string(), code: z.string() }),
          404: z.object({ message: z.string() }),
          429: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
          503: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { UsuCodigo, senha, tipoAcesso: loginAccessType } = request.body as LoginBody;
      if (isProduction && !LOGIN_PROXY_SECRET) {
        request.log.error({ event: "login_proxy_not_configured" }, "Configure LOGIN_PROXY_SECRET no ambiente do servidor");
        return reply.status(503).send({ message: "Autenticacao temporariamente indisponivel." });
      }
      if (isProduction && !hasLoginProxySecret(request)) {
        request.log.warn(
          {
            event: "direct_login_rejected",
            ip: request.ip,
            userAgent: request.headers["user-agent"],
          },
          "Rejected direct login request",
        );
        return reply.status(404).send({ message: "Rota nao encontrada." });
      }

      if (limitAccount(request, reply, UsuCodigo, 5, 15 * 60_000)) return;
      try {
        const loginIdentifier = UsuCodigo.trim();
        let codigoReal = "";
        let nomeReal = "";
        let emailReal = "";
        let tipoParaToken = "";
        let tokenTipo = "";
        let tipoAcesso = "";
        let usuarioDesligado = false;
        let storedHash = "";

        // Tenta primeiro como usuário do sistema
        if (loginAccessType === "USUARIO") {
          const user = await userService.getUserByCode(loginIdentifier);
          if (!user || !user.UsuSenha) {
            return rejectCredentials(senha, reply);
          }
          codigoReal = user.UsuCodigo;
          nomeReal = user.UsuNome ?? "";
          emailReal = user.UsuEmail ?? "";
          tipoParaToken = normalizeUserType(user.UsuTipo);
          usuarioDesligado = tipoParaToken === DISABLED_USER_TYPE;
          tokenTipo = getUserTokenType(tipoParaToken);
          tipoAcesso = "USUARIO";
          storedHash = user.UsuSenha.trim();
        } else if (loginAccessType === "APRENDIZ") {
          // Tenta como aprendiz (CPF ou código)
          const cpfWithoutMask = loginIdentifier.replace(/\D/g, "");
          const isAprendizCode = /^\d+$/.test(loginIdentifier);
          const aprendiz = await prisma.cA_Aprendiz.findFirst({
            where: {
              OR: [
                { Apr_CPF: loginIdentifier },
                ...(cpfWithoutMask && cpfWithoutMask !== loginIdentifier
                  ? [{ Apr_CPF: cpfWithoutMask }]
                  : []),
                ...(isAprendizCode ? [{ Apr_Codigo: BigInt(loginIdentifier) }] : []),
              ],
            },
          });
          if (!aprendiz) {
            return rejectCredentials(senha, reply);
          }
          if (!aprendiz.Apr_senha) return rejectCredentials(senha, reply);
          codigoReal = String(aprendiz.Apr_Codigo);
          nomeReal = aprendiz.Apr_Nome ?? "";
          emailReal = aprendiz.Apr_Email ?? "";
          tipoParaToken = "APRENDIZ";
          tokenTipo = "APRENDIZ";
          tipoAcesso = "APRENDIZ";
          storedHash = aprendiz.Apr_senha.trim();
        } else if (loginAccessType === "EDUCADOR") {
          const cpfWithoutMask = loginIdentifier.replace(/\D/g, "");
          const numericIdentifier = Number(loginIdentifier);
          const isEducadorCode =
            /^\d+$/.test(loginIdentifier) &&
            Number.isSafeInteger(numericIdentifier) &&
            numericIdentifier <= 2147483647;
          const educador = await prisma.cA_Educadores.findFirst({
            where: {
              OR: [
                { EducCPF: loginIdentifier },
                ...(cpfWithoutMask && cpfWithoutMask !== loginIdentifier
                  ? [{ EducCPF: cpfWithoutMask }]
                  : []),
                ...(isEducadorCode ? [{ EducCodigo: numericIdentifier }] : []),
              ],
            },
          });
          if (!educador) {
            return rejectCredentials(senha, reply);
          }
          if (!educador.EducSenha) return rejectCredentials(senha, reply);
          codigoReal = String(educador.EducCodigo);
          nomeReal = educador.EducNome ?? "";
          emailReal = educador.EducEMail ?? "";
          tipoParaToken = "EDUCADOR";
          tokenTipo = "EDUCADOR";
          tipoAcesso = "EDUCADOR";
          storedHash = educador.EducSenha.trim();
        } else if (loginAccessType === "EMPRESA") {
          const cnpjWithoutMask = loginIdentifier.replace(/\D/g, "");
          const numericIdentifier = Number(loginIdentifier);
          const isEmpresaCode =
            /^\d+$/.test(loginIdentifier) &&
            Number.isSafeInteger(numericIdentifier) &&
            numericIdentifier <= 2147483647;
          const empresa = await prisma.cA_Parceiros.findFirst({
            where: {
              OR: [
                { ParCNPJ: loginIdentifier },
                ...(cnpjWithoutMask && cnpjWithoutMask !== loginIdentifier
                  ? [{ ParCNPJ: cnpjWithoutMask }]
                  : []),
                ...(isEmpresaCode ? [{ ParCodigo: numericIdentifier }] : []),
              ],
            },
          });
          if (!empresa) {
            return rejectCredentials(senha, reply);
          }
          if (!empresa.ParSenha) return rejectCredentials(senha, reply);
          codigoReal = String(empresa.ParCodigo);
          nomeReal = empresa.ParNomeFantasia ?? empresa.ParDescricao;
          emailReal = empresa.ParEmail ?? "";
          tipoParaToken = "EMPRESA";
          tokenTipo = "EMPRESA";
          tipoAcesso = "EMPRESA";
          storedHash = empresa.ParSenha.trim();
        } else {
          return reply.status(401).send({ message: "Tipo de acesso invalido." });
        }
        const isPasswordValid = await bcrypt.compare(senha, storedHash);
        if (!isPasswordValid) {
          return reply
            .status(401)
            .send({ message: INVALID_CREDENTIALS });
        }
        if (usuarioDesligado) {
          logger.auth.loginFailed(
            UsuCodigo,
            "Usuário desligado tentou acessar o sistema",
            request.ip,
          );
          return reply.status(403).send({
            message: "Usuário desligado. Login não permitido.",
            code: "USER_DISABLED",
          });
        }
        accountLimiter.clear(`login:${loginAccessType}`, loginAccessType === "USUARIO" ? UsuCodigo : UsuCodigo.replace(/\D/g, "") || UsuCodigo);
        const token = app.jwt.sign(
          {
            jti: randomUUID(),
            nome: nomeReal,
            role: tipoParaToken,
            tokenTipo,
            tipoAcesso,
          },
          {
            sub: codigoReal,
            expiresIn: "8h",
          },
        );
        reply.setCookie("token", token, {
          ...COOKIE_OPTIONS,
          maxAge: 28800,
        });
        return reply.status(200).send({
          message: "Login realizado com sucesso",
          token,
          user: {
            UsuCodigo: codigoReal,
            UsuNome: nomeReal,
            UsuEmail: emailReal,
            UsuTipo: tipoParaToken,
            TokenTipo: tokenTipo,
            TipoAcesso: tipoAcesso,
          },
        });
      } catch (error) {
        request.log.error({ event: "login_failed" }, "Falha interna no login");
        return reply.status(500).send({ message: "Erro interno no servidor." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().post(
    "/logout",
    {
      schema: {
        tags: ["Autenticação"],
        summary: "Logout",
        response: {
          200: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      reply.setCookie("token", "", {
        ...COOKIE_OPTIONS,
        maxAge: 0,
        expires: new Date(0),
      });
      return reply.send({ message: "Logout efetuado com sucesso" });
    },
  );
  for (const recoveryRoute of ["/forgot-password", "/primeiro-acesso"]) {
  app.withTypeProvider<ZodTypeProvider>().post(
    recoveryRoute,
    {
      config: {
        rateLimit: authRateLimit(3, "1 hour"),
      },
      schema: {
        tags: ["Autenticação"],
        summary: "Solicitação de redefinição de senha",
        body: z.object({
          email: z.string().trim().email("E-mail inválido").max(254),
          tipoAcesso: z.enum(PASSWORD_RESET_ACCESS_TYPES).optional().default("USUARIO"),
        }).strict(),
        response: {
          200: z.object({ message: z.string() }),
          429: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { email, tipoAcesso } = request.body as {
        email: string;
        tipoAcesso: PasswordResetAccessType;
      };
      if (limitAccount(request, reply, email, 3, 60 * 60_000)) return;
      try {
        const target = await findPasswordResetTarget(email, tipoAcesso);
        if (target) {
          const resetToken = app.jwt.sign(
            {
              purpose: "password-reset",
              jti: randomUUID(),
              email: target.email,
              tipoAcesso: target.tipoAcesso,
              resetSubject: target.resetSubject,
              passwordFingerprint: passwordResetFingerprint(target.passwordHash),
            },
            { expiresIn: "1h" }
          );
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
          try {
            await sendResetPasswordEmail(target.email, resetLink);
          } catch (mailError) {
            request.log.error(
              {
                event: "password_reset_email_failed",
                tipoAcesso,
              },
              "Falha ao enviar e-mail de recuperação",
            );
            logger.error("Falha ao enviar e-mail de recuperação", { email, tipoAcesso });
          }
        }
        // Resposta uniforme — não confirma se o e-mail existe
        return reply.status(200).send({ message: "Se o e-mail estiver cadastrado, você receberá as instruções." });
      } catch (error) {
        request.log.error(
          {
            event: "forgot_password_failed",
            tipoAcesso,
          },
          "Erro no forgot-password",
        );
        return reply.status(500).send({ message: "Erro interno no servidor." });
      }
    }
  );
  }
  app.withTypeProvider<ZodTypeProvider>().post(
    "/reset-password",
    {
      config: {
        rateLimit: authRateLimit(3),
      },
      schema: {
        tags: ["Autenticação"],
        summary: "Criar uma nova senha usando um token de recuperação",
        body: z.object({
          token: z.string().min(1).max(4096),
          newPassword: z.string().min(PASSWORD_MIN_LENGTH, "A senha deve ter no minimo 12 caracteres.").max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "A senha deve ter no maximo 72 bytes."),
        }).strict(),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { token, newPassword } = request.body as { token: string; newPassword: string };
      try {
        const decoded = resetClaimsSchema.parse(app.jwt.verify(token));
        const { email, tipoAcesso } = decoded;
        const currentPasswordHash = await findCurrentPasswordHash({
          email,
          tipoAcesso,
          resetSubject: decoded.resetSubject,
        });
        if (
          !decoded.passwordFingerprint ||
          decoded.passwordFingerprint !== passwordResetFingerprint(currentPasswordHash)
        ) {
          return reply.status(400).send({ message: "Token invalido ou ja utilizado." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await updatePasswordResetTarget({
          tipoAcesso,
          resetSubject: decoded.resetSubject,
          previousPasswordHash: currentPasswordHash,
          hashedPassword,
        });
        if (!updated) {
          return reply.status(400).send({ message: "Token invalido ou ja utilizado." });
        }
        return reply.send({ message: "Senha alterada com sucesso." });
      } catch (error) {
        return reply.status(400).send({ message: "Token inválido ou expirado." });
      }
    }
  );
}
