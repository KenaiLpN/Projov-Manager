import { z } from "zod";

export const loginAccessTypeSchema = z.enum(["USUARIO", "APRENDIZ", "EDUCADOR", "EMPRESA"]);

export const loginBodySchema = z.object({
  UsuCodigo: z.string().trim().min(1, "O código do usuário é obrigatório"),
  senha: z.string().optional().default(""),
  tipoAcesso: loginAccessTypeSchema.optional().default("USUARIO"),
}).strict();
export type LoginBody = z.infer<typeof loginBodySchema>;
export const createUserBodySchema = z.object({
  UsuCodigo: z
    .string()
    .min(1, "O código do usuário é obrigatório.")
    .max(8, "O código do usuário deve ter no máximo 8 caracteres."),
  UsuNome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  UsuEmail: z
    .string()
    .email("Formato de e-mail inválido.")
    .max(100, "O e-mail deve ter no máximo 100 caracteres.")
    .nullable()
    .optional(),
  UsuTipo: z
    .string()
    .max(20, "O tipo de usuário deve ter no máximo 20 caracteres.")
    .optional()
    .nullable(),
  UsuSenha: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(255, "A senha deve ter no máximo 255 caracteres."),
});
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export const userResponseSchema = z.object({
  UsuCodigo: z.string(),
  UsuNome: z.string().nullable(),
  UsuTipo: z.string().nullable(),
  UsuEmail: z.string().nullable(),
  chk_ativo: z.boolean().default(true),
  id_usuario: z.number().nullable().optional(),
  criado_em: z.date().nullable().optional(),
  atualizado_em: z.date().nullable().optional(),
});
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export const listUsersResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateUserParamsSchema = z.object({
  id: z.string(),
});
export const updateUserBodySchema = createUserBodySchema.partial();
export type UpdateUserParams = z.infer<typeof updateUserParamsSchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export const deleteUserParamsSchema = z.object({
  id: z.string(),
});
export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;
