import api from "./api";
import { z } from "zod";
import { getApiErrorMessage } from "@/utils/apiError";
import { chamadoResponseSchema, conversationResponseSchema, notificationsResponseSchema, parseChamadoResponse } from "./chamadoResponse";

export const CHAMADO_DEPARTAMENTOS = [
 "Relações Empresariais",
 "Administração",
 "Aprendizagem",
 "Capacitação",
 "Projetos",
 "DSO"
] as const;

export type ChamadoDepartamento = (typeof CHAMADO_DEPARTAMENTOS)[number];
export type ChamadoUrgencia =
  | "nao_classificada"
  | "minima"
  | "media"
  | "maxima";
export type ChamadoStatus =
  | "aberto"
  | "em_analise"
  | "em_atendimento"
  | "pendente"
  | "resolvido"
  | "cancelado";

export type ChamadoResolucao = {
  id: number;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  observacao?: string | null;
  resolvido_em: string;
};

export type ChamadoConversationMessage = {
  id: number;
  chamado_id: number;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  usuario_tipo?: string | null;
  tipo_evento: "comentario_publico" | "resolucao";
  status_anterior?: string | null;
  status_novo?: string | null;
  comentario?: string | null;
  criado_em: string;
};

export type ChamadoNotificationCategory =
  | "abertura"
  | "mensagem"
  | "resolucao";

export type ChamadoNotificationEvent = Omit<ChamadoConversationMessage, "tipo_evento"> & {
  tipo_evento: ChamadoConversationMessage["tipo_evento"] | "criado";
  categoria: ChamadoNotificationCategory;
  chamado: Pick<
    Chamado,
    | "id"
    | "protocolo"
    | "solicitante_id"
    | "solicitante_nome"
    | "tecnico_responsavel_id"
  >;
};

export type ChamadoNotificationFeed = {
  data: ChamadoNotificationEvent[];
  cursor: number;
};

export type Chamado = {
  id: number;
  protocolo?: string | null;
  solicitante_id?: string | null;
  solicitante_nome: string;
  solicitante_email?: string | null;
  solicitante_funcao?: string | null;
  departamento_nome?: string | null;
  patrimonio_codigo?: string | null;
  titulo: string;
  descricao: string;
  observacao?: string | null;
  status: ChamadoStatus;
  prioridade_interna: ChamadoUrgencia;
  tecnico_responsavel_id?: string | null;
  tecnico_responsavel_nome?: string | null;
  aberto_em: string;
  resolvido_em?: string | null;
  atualizado_em: string;
  resolucoes: ChamadoResolucao[];
};

export type ChamadoFormData = {
  departamento: ChamadoDepartamento;
  patrimonio_codigo?: string;
  descricao: string;
  observacao?: string;
};

type ApiData<T> = { data: T };

export async function listChamados(search?: string, patrimonio?: string) {
  const params = {
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(patrimonio?.trim() ? { patrimonio: patrimonio.trim() } : {}),
  };
  const response = await api.get<ApiData<Chamado[]>>("chamados", {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return parseChamadoResponse(z.object({ data: z.array(chamadoResponseSchema) }), response.data).data;
}

export async function createChamado(data: ChamadoFormData) {
  const response = await api.post<ApiData<Chamado>>("chamados", data);
  return parseChamadoResponse(z.object({ data: chamadoResponseSchema }), response.data).data;
}

export async function updateChamado(id: number, data: ChamadoFormData) {
  const response = await api.patch<ApiData<Chamado>>(`chamados/${id}`, data);
  return parseChamadoResponse(z.object({ data: chamadoResponseSchema }), response.data).data;
}

export async function updateChamadoUrgencia(
  id: number,
  urgencia: Exclude<ChamadoUrgencia, "nao_classificada">,
) {
  const response = await api.patch<ApiData<Chamado>>(
    `chamados/${id}/urgencia`,
    { urgencia },
  );
  return parseChamadoResponse(z.object({ data: chamadoResponseSchema }), response.data).data;
}

export async function resolveChamado(id: number, observacao?: string) {
  const response = await api.post<ApiData<Chamado>>(
    `chamados/${id}/resolver`,
    { observacao },
  );
  return parseChamadoResponse(z.object({ data: chamadoResponseSchema }), response.data).data;
}

export async function listChamadoConversation(id: number) {
  const response = await api.get<ApiData<ChamadoConversationMessage[]>>(
    `chamados/${id}/conversa`,
  );
  return parseChamadoResponse(z.object({ data: z.array(conversationResponseSchema) }), response.data).data;
}

export async function sendChamadoMessage(
  id: number,
  data: {
    mensagem: string;
    enviar_solucao_teste?: boolean;
    problema_persiste?: boolean;
  },
) {
  const response = await api.post<
    ApiData<{ ticket: Chamado; message: ChamadoConversationMessage }>
  >(`chamados/${id}/mensagens`, data);
  return parseChamadoResponse(z.object({ data: z.object({ ticket: chamadoResponseSchema, message: conversationResponseSchema }) }), response.data).data;
}

export async function confirmChamadoSolution(id: number) {
  const response = await api.post<ApiData<Chamado>>(
    `chamados/${id}/confirmar-solucao`,
  );
  return parseChamadoResponse(z.object({ data: chamadoResponseSchema }), response.data).data;
}

export async function listChamadoNotifications(after?: number) {
  const response = await api.get<ChamadoNotificationFeed>(
    "chamados/notificacoes",
    { params: after === undefined ? undefined : { after } },
  );
  return parseChamadoResponse(notificationsResponseSchema, response.data);
}

export const chamadoErrorMessage = getApiErrorMessage;
