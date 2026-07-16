import api from "./api";

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

export type Chamado = {
  id: number;
  protocolo?: string | null;
  solicitante_id?: string | null;
  solicitante_nome: string;
  solicitante_email?: string | null;
  solicitante_funcao?: string | null;
  departamento_nome?: string | null;
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
  descricao: string;
  observacao?: string;
};

type ApiData<T> = { data: T };

export async function listChamados(search?: string) {
  const response = await api.get<ApiData<Chamado[]>>("chamados", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return response.data.data;
}

export async function createChamado(data: ChamadoFormData) {
  const response = await api.post<ApiData<Chamado>>("chamados", data);
  return response.data.data;
}

export async function updateChamado(id: number, data: ChamadoFormData) {
  const response = await api.patch<ApiData<Chamado>>(`chamados/${id}`, data);
  return response.data.data;
}

export async function updateChamadoUrgencia(
  id: number,
  urgencia: Exclude<ChamadoUrgencia, "nao_classificada">,
) {
  const response = await api.patch<ApiData<Chamado>>(
    `chamados/${id}/urgencia`,
    { urgencia },
  );
  return response.data.data;
}

export async function resolveChamado(id: number, observacao?: string) {
  const response = await api.post<ApiData<Chamado>>(
    `chamados/${id}/resolver`,
    { observacao },
  );
  return response.data.data;
}

export function chamadoErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;
    if (response?.data?.message) return response.data.message;
  }

  return fallback;
}

