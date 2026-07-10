import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserService } from "../services/UserService";
import { loginBodySchema, LoginBody } from "../schemas/userSchema";
import { prisma } from "../lib/prisma";
import { sendResetPasswordEmail } from "../services/mail";
import { logger } from "../lib/logger";
import { createHash, timingSafeEqual } from "crypto";

const userService = new UserService();
const isProduction = process.env.NODE_ENV === "production";
const LOGIN_PROXY_SECRET = process.env.LOGIN_PROXY_SECRET?.trim();
const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  partitioned: isProduction,
  signed: false,
} as const;

const DISABLED_USER_TYPE = "D";
const PASSWORD_MIN_LENGTH = 12;

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

function authRateLimit(max: number) {
  return {
    max,
    timeWindow: "15 minutes",
    continueExceeding: true,
    errorResponseBuilder: (_request: unknown, context: { statusCode: number }) => ({
      statusCode: context.statusCode,
      message: "Muitas tentativas. Tente novamente em 15 minutos.",
    }),
    onExceeded: (request: any) => logAuthRateLimit(request),
  };
}

function safeSecretMatch(value: string, expected: string) {
  const actual = Buffer.from(value);
  const target = Buffer.from(expected);
  return actual.length === target.length && timingSafeEqual(actual, target);
}

function isTrustedLoginProxy(request: any) {
  if (!isProduction || !LOGIN_PROXY_SECRET) return true;

  const providedSecret = request.headers["x-prosis-login-secret"];
  return (
    typeof providedSecret === "string" &&
    safeSecretMatch(providedSecret, LOGIN_PROXY_SECRET)
  );
}

function isPasswordResetAccessType(value: unknown): value is PasswordResetAccessType {
  return (
    typeof value === "string" &&
    PASSWORD_RESET_ACCESS_TYPES.includes(value as PasswordResetAccessType)
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
  email: string;
  tipoAcesso: PasswordResetAccessType;
  resetSubject?: string;
  hashedPassword: string;
}) {
  const { email, tipoAcesso, resetSubject, hashedPassword } = params;

  if (tipoAcesso === "USUARIO") {
    const user = resetSubject
      ? await (prisma as any).cA_Usuarios.findUnique({
          where: { UsuCodigo: resetSubject },
          select: { UsuCodigo: true },
        })
      : await (prisma as any).cA_Usuarios.findFirst({
          where: { UsuEmail: email },
          select: { UsuCodigo: true },
        });
    if (!user) return false;
    await (prisma as any).cA_Usuarios.update({
      where: { UsuCodigo: user.UsuCodigo },
      data: { UsuSenha: hashedPassword },
    });
    return true;
  }

  if (tipoAcesso === "APRENDIZ") {
    const aprendizCode = parsePositiveBigInt(resetSubject);
    const aprendiz = aprendizCode
      ? await prisma.cA_Aprendiz.findUnique({
          where: { Apr_Codigo: aprendizCode },
          select: { Apr_Codigo: true },
        })
      : await prisma.cA_Aprendiz.findFirst({
          where: { Apr_Email: email },
          select: { Apr_Codigo: true },
        });
    if (!aprendiz) return false;
    await prisma.cA_Aprendiz.update({
      where: { Apr_Codigo: aprendiz.Apr_Codigo },
      data: { Apr_senha: hashedPassword },
    });
    return true;
  }

  if (tipoAcesso === "EDUCADOR") {
    const educadorCode = parsePositiveSafeInteger(resetSubject);
    const educador = educadorCode
      ? await prisma.cA_Educadores.findUnique({
          where: { EducCodigo: educadorCode },
          select: { EducCodigo: true },
        })
      : await prisma.cA_Educadores.findFirst({
          where: { EducEMail: email },
          select: { EducCodigo: true },
        });
    if (!educador) return false;
    await prisma.cA_Educadores.update({
      where: { EducCodigo: educador.EducCodigo },
      data: { EducSenha: hashedPassword },
    });
    return true;
  }

  const empresaCode = parsePositiveSafeInteger(resetSubject);
  const empresa = empresaCode
    ? await prisma.cA_Parceiros.findUnique({
        where: { ParCodigo: empresaCode },
        select: { ParCodigo: true },
      })
    : await prisma.cA_Parceiros.findFirst({
        where: { ParEmail: email },
        select: { ParCodigo: true },
      });
  if (!empresa) return false;
  await prisma.cA_Parceiros.update({
    where: { ParCodigo: empresa.ParCodigo },
    data: { ParSenha: hashedPassword },
  });
  return true;
}

export async function authRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      config: {
        rateLimit: authRateLimit(5),
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
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { UsuCodigo, senha, tipoAcesso: loginAccessType } = request.body as LoginBody;
      if (!isTrustedLoginProxy(request)) {
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
            logger.auth.loginFailed(loginIdentifier, "Usuario nao encontrado", request.ip);
            return reply.status(401).send({ message: "Credenciais invÃ¡lidas." });
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
            logger.auth.loginFailed(loginIdentifier, "Aprendiz nao encontrado", request.ip);
            return reply.status(401).send({ message: "Credenciais inválidas." });
          }
          if (!aprendiz.Apr_senha) {
            return reply.status(403).send({
              message: "Primeiro acesso: Crie sua senha.",
              code: "NEEDS_PASSWORD",
            });
          }
          codigoReal = String(Number(aprendiz.Apr_Codigo));
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
            logger.auth.loginFailed(loginIdentifier, "Educador nao encontrado", request.ip);
            return reply.status(401).send({ message: "Credenciais invalidas." });
          }
          if (!educador.EducSenha) {
            return reply.status(403).send({
              message: "Primeiro acesso: Crie sua senha.",
              code: "NEEDS_PASSWORD",
            });
          }
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
            logger.auth.loginFailed(loginIdentifier, "Empresa nao encontrada", request.ip);
            return reply.status(401).send({ message: "Credenciais invalidas." });
          }
          if (!empresa.ParSenha) {
            return reply.status(403).send({
              message: "Primeiro acesso: Crie sua senha.",
              code: "NEEDS_PASSWORD",
            });
          }
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
            .send({ message: "Credenciais inválidas (Senha)." });
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
        const token = app.jwt.sign(
          {
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
        console.error("Erro no login:", error);
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
  app.withTypeProvider<ZodTypeProvider>().post(
    "/primeiro-acesso",
    {
      config: {
        rateLimit: authRateLimit(5),
      },
      schema: {
        tags: ["Autenticação"],
        summary: "Cria a senha do Aprendiz no primeiro acesso",
        body: z.object({
          UsuCodigo: z.string(),
          senha: z.string().min(PASSWORD_MIN_LENGTH),
          tipoAcesso: z.enum(["APRENDIZ", "EDUCADOR", "EMPRESA"]).optional().default("APRENDIZ"),
        }),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          429: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { UsuCodigo, senha, tipoAcesso } = request.body as {
        UsuCodigo: string;
        senha: string;
        tipoAcesso: "APRENDIZ" | "EDUCADOR" | "EMPRESA";
      };
      try {
        const accessIdentifier = UsuCodigo.trim();
        const cpfWithoutMask = accessIdentifier.replace(/\D/g, "");
        if (tipoAcesso === "EMPRESA") {
          const numericIdentifier = Number(accessIdentifier);
          const isEmpresaCode =
            /^\d+$/.test(accessIdentifier) &&
            Number.isSafeInteger(numericIdentifier) &&
            numericIdentifier <= 2147483647;
          const empresa = await prisma.cA_Parceiros.findFirst({
            where: {
              OR: [
                { ParCNPJ: accessIdentifier },
                ...(cpfWithoutMask && cpfWithoutMask !== accessIdentifier
                  ? [{ ParCNPJ: cpfWithoutMask }]
                  : []),
                ...(isEmpresaCode ? [{ ParCodigo: numericIdentifier }] : []),
              ],
            },
          });
          if (!empresa) {
            return reply.status(404).send({ message: "Empresa nao encontrada." });
          }
          if (empresa.ParSenha) {
            return reply.status(400).send({ message: "Empresa ja possui uma senha criada." });
          }
          const hashedPassword = await bcrypt.hash(senha, 10);
          await prisma.cA_Parceiros.update({
            where: { ParCodigo: empresa.ParCodigo },
            data: { ParSenha: hashedPassword },
          });
          return reply.send({ message: "Senha criada com sucesso. Faca o login agora." });
        }
        if (tipoAcesso === "EDUCADOR") {
          const numericIdentifier = Number(accessIdentifier);
          const isEducadorCode =
            /^\d+$/.test(accessIdentifier) &&
            Number.isSafeInteger(numericIdentifier) &&
            numericIdentifier <= 2147483647;
          const educador = await prisma.cA_Educadores.findFirst({
            where: {
              OR: [
                { EducCPF: accessIdentifier },
                ...(cpfWithoutMask && cpfWithoutMask !== accessIdentifier
                  ? [{ EducCPF: cpfWithoutMask }]
                  : []),
                ...(isEducadorCode ? [{ EducCodigo: numericIdentifier }] : []),
              ],
            },
          });
          if (!educador) {
            return reply.status(404).send({ message: "Educador nao encontrado." });
          }
          if (educador.EducSenha) {
            return reply.status(400).send({ message: "Educador ja possui uma senha criada." });
          }
          const hashedPassword = await bcrypt.hash(senha, 10);
          await prisma.cA_Educadores.update({
            where: { EducCodigo: educador.EducCodigo },
            data: { EducSenha: hashedPassword },
          });
          return reply.send({ message: "Senha criada com sucesso. Faca o login agora." });
        }
        const isAprendizCode = /^\d+$/.test(accessIdentifier);
        const aprendiz = await prisma.cA_Aprendiz.findFirst({
          where: {
            OR: [
              { Apr_CPF: accessIdentifier },
              ...(cpfWithoutMask && cpfWithoutMask !== accessIdentifier
                ? [{ Apr_CPF: cpfWithoutMask }]
                : []),
              ...(isAprendizCode ? [{ Apr_Codigo: BigInt(accessIdentifier) }] : [])
            ]
          }
        });
        if (!aprendiz) {
          return reply.status(404).send({ message: "Aprendiz não encontrado." });
        }
        if (aprendiz.Apr_senha) {
          return reply.status(400).send({ message: "Aprendiz já possui uma senha criada." });
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        await prisma.cA_Aprendiz.update({
          where: { Apr_Codigo: aprendiz.Apr_Codigo },
          data: { Apr_senha: hashedPassword }
        });
        return reply.send({ message: "Senha criada com sucesso. Faça o login agora." });
      } catch (error) {
        console.error("Erro no primeiro-acesso:", error);
        return reply.status(500).send({ message: "Erro interno no servidor." });
      }
    }
  );
  app.withTypeProvider<ZodTypeProvider>().post(
    "/forgot-password",
    {
      config: {
        rateLimit: authRateLimit(3),
      },
      schema: {
        tags: ["Autenticação"],
        summary: "Solicitação de redefinição de senha",
        body: z.object({
          email: z.string().trim().email("E-mail inválido"),
          tipoAcesso: z.enum(PASSWORD_RESET_ACCESS_TYPES).optional().default("USUARIO"),
        }),
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
      try {
        const target = await findPasswordResetTarget(email, tipoAcesso);
        if (target) {
          const resetToken = app.jwt.sign(
            {
              email: target.email,
              tipoAcesso: target.tipoAcesso,
              resetSubject: target.resetSubject,
              passwordFingerprint: passwordResetFingerprint(target.passwordHash),
            },
            { expiresIn: "1h" }
          );
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
          if (process.env.NODE_ENV !== "production") {
            console.log("Reset link gerado (dev only): " + resetLink);
          }
          try {
            await sendResetPasswordEmail(target.email, resetLink);
          } catch (mailError) {
            logger.error("Falha ao enviar e-mail de recuperação", { email, tipoAcesso });
          }
        }
        // Resposta uniforme — não confirma se o e-mail existe
        return reply.status(200).send({ message: "Se o e-mail estiver cadastrado, você receberá as instruções." });
      } catch (error) {
        console.error("Erro no forgot-password:", error);
        return reply.status(500).send({ message: "Erro interno no servidor." });
      }
    }
  );
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
          token: z.string(),
          newPassword: z.string().min(PASSWORD_MIN_LENGTH, "A senha deve ter no minimo 12 caracteres."),
        }),
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
        const decoded = app.jwt.verify<{
          email: string;
          tipoAcesso?: PasswordResetAccessType;
          resetSubject?: string;
          passwordFingerprint?: string;
        }>(token);
        const email = decoded.email;
        const tipoAcesso = isPasswordResetAccessType(decoded.tipoAcesso)
          ? decoded.tipoAcesso
          : "USUARIO";
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
          email,
          tipoAcesso,
          resetSubject: decoded.resetSubject,
          hashedPassword,
        });
        if (!updated) {
          return reply.status(404).send({ message: "Registro não encontrado." });
        }
        return reply.send({ message: "Senha alterada com sucesso." });
      } catch (error) {
        console.error("Erro no reset-password:", error);
        return reply.status(400).send({ message: "Token inválido ou expirado." });
      }
    }
  );
  if (process.env.NODE_ENV !== "production") {
    app.get("/debug/user-tipo", async (request: any, reply: FastifyReply) => {
      const { codigo } = request.query as { codigo?: string };
      if (!codigo) {
        return reply
          .status(400)
          .send({ message: "Parâmetro 'codigo' obrigatório." });
      }
      const user = await userService.getUserByCode(codigo);
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado." });
      }
      return reply.send({
        UsuCodigo: user.UsuCodigo,
        UsuTipo_raw: user.UsuTipo,
        UsuTipo_length: user.UsuTipo?.length ?? null,
        UsuTipo_json: JSON.stringify(user.UsuTipo),
        UsuNome: user.UsuNome,
      });
    });
  }
}
