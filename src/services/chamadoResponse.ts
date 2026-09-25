import { z } from "zod";
import type { Chamado, ChamadoConversationMessage, ChamadoNotificationFeed } from "./chamadoService";
import { InvalidApiResponseError } from "../utils/apiResponse";

const nullableText = z.string().nullable().optional();
const id = z.number().int().nonnegative();
const resolution = z.object({
  id, usuario_id: nullableText, usuario_nome: nullableText,
  observacao: nullableText, resolvido_em: z.string(),
}).passthrough();
export const chamadoResponseSchema: z.ZodType<Chamado> = z.object({
  id, protocolo: nullableText, solicitante_id: nullableText,
  solicitante_nome: z.string(), solicitante_email: nullableText,
  solicitante_funcao: nullableText, departamento_nome: nullableText,
  patrimonio_codigo: nullableText, titulo: z.string(), descricao: z.string(),
  observacao: nullableText,
  status: z.enum(["aberto", "em_analise", "em_atendimento", "pendente", "resolvido", "cancelado"]),
  prioridade_interna: z.enum(["nao_classificada", "minima", "media", "maxima"]),
  tecnico_responsavel_id: nullableText, tecnico_responsavel_nome: nullableText,
  aberto_em: z.string(), resolvido_em: nullableText, atualizado_em: z.string(),
  resolucoes: z.array(resolution),
}).passthrough();
const messageShape = {
  id, chamado_id: id, usuario_id: nullableText, usuario_nome: nullableText,
  usuario_tipo: nullableText, tipo_evento: z.enum(["comentario_publico", "resolucao"]),
  status_anterior: nullableText, status_novo: nullableText,
  comentario: nullableText, criado_em: z.string(),
};
export const conversationResponseSchema: z.ZodType<ChamadoConversationMessage> = z.object(messageShape).passthrough();
export const notificationsResponseSchema: z.ZodType<ChamadoNotificationFeed> = z.object({
  cursor: id,
  data: z.array(z.object({
    ...messageShape,
    tipo_evento: z.enum(["criado", "comentario_publico", "resolucao"]),
    categoria: z.enum(["abertura", "mensagem", "resolucao"]),
    chamado: z.object({ id, protocolo: nullableText, solicitante_id: nullableText,
      solicitante_nome: z.string(), tecnico_responsavel_id: nullableText }).passthrough(),
  }).passthrough()),
}).passthrough();

export function parseChamadoResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  // Não incluir payload, dados pessoais ou erros do schema nos logs do navegador.
  if (!result.success) throw new InvalidApiResponseError();
  return result.data;
}
