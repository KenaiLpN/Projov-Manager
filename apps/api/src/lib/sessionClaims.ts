import { z } from "zod";
import { normalizeRoleCode } from "./authorization";

// Executar somente DEPOIS da verificacao criptografica e de expiracao do JWT.
// Tokens de recuperacao possuem email/resetSubject, mas nao sub/role de sessao.
const sessionClaimsSchema = z.object({
  sub: z.string().trim().min(1),
  nome: z.string(),
  role: z.string().transform(normalizeRoleCode).pipe(z.enum(["A", "C", "P", "T", "E", "S", "DEV", "APRENDIZ", "EDUCADOR", "EMPRESA"])),
  tokenTipo: z.string().min(1),
  tipoAcesso: z.enum(["USUARIO", "APRENDIZ", "EDUCADOR", "EMPRESA"]),
  exp: z.number().int().positive(),
}).passthrough().superRefine((claims, context) => {
  const externalRole = ["APRENDIZ", "EDUCADOR", "EMPRESA"].includes(claims.role);
  if ((externalRole && claims.tipoAcesso !== claims.role) || (!externalRole && claims.tipoAcesso !== "USUARIO")) {
    context.addIssue({ code: "custom", message: "Tipo de sessao inconsistente." });
  }
});

export function parseSessionClaims(value: unknown) {
  const parsed = sessionClaimsSchema.safeParse(value);
  if (!parsed.success) throw new Error("Token nao representa uma sessao valida.");
  return parsed.data;
}
