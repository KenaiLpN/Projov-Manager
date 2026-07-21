import { z } from "zod";

export const chamadoDepartamentos = [
  "Comercial",
  "Marketing",
  "Aprendizagem",
  "Projetos",
  "Administração",
] as const;

export const chamadoUrgencias = ["minima", "media", "maxima"] as const;

export const chamadoParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Número de chamado inválido."),
});

export const chamadoListQuerySchema = z.object({
  search: z.string().trim().max(180).optional(),
  patrimonio: z.string().trim().max(60).optional(),
});

export const chamadoNotificationQuerySchema = z.object({
  after: z.string().regex(/^\d+$/, "Cursor de notificação inválido.").optional(),
});

export const chamadoCreateBodySchema = z.object({
  departamento: z.enum(chamadoDepartamentos),
  patrimonio_codigo: z.string().trim().max(60).optional(),
  descricao: z
    .string()
    .trim()
    .min(10, "Descreva o problema com pelo menos 10 caracteres.")
    .max(5000),
  observacao: z.string().trim().max(3000).optional(),
});

export const chamadoUpdateBodySchema = chamadoCreateBodySchema;

export const chamadoUrgenciaBodySchema = z.object({
  urgencia: z.enum(chamadoUrgencias),
});

export const chamadoResolucaoBodySchema = z.object({
  observacao: z.string().trim().max(3000).optional(),
});

export const chamadoMensagemBodySchema = z
  .object({
    mensagem: z
      .string()
      .trim()
      .min(1, "Digite uma mensagem.")
      .max(3000),
    enviar_solucao_teste: z.boolean().optional(),
    problema_persiste: z.boolean().optional(),
  })
  .refine(
    (body) => !(body.enviar_solucao_teste && body.problema_persiste),
    "A mensagem não pode enviar uma solução e rejeitá-la ao mesmo tempo.",
  );

export type ChamadoListQuery = z.infer<typeof chamadoListQuerySchema>;
export type ChamadoNotificationQuery = z.infer<
  typeof chamadoNotificationQuerySchema
>;
export type ChamadoCreateBody = z.infer<typeof chamadoCreateBodySchema>;
export type ChamadoUpdateBody = z.infer<typeof chamadoUpdateBodySchema>;
export type ChamadoUrgenciaBody = z.infer<typeof chamadoUrgenciaBodySchema>;
export type ChamadoResolucaoBody = z.infer<typeof chamadoResolucaoBodySchema>;
export type ChamadoMensagemBody = z.infer<typeof chamadoMensagemBodySchema>;
