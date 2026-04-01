import api from "./api";
export interface OcorrenciaTipo {
  OcoCodigo: number;
  OcoDescricao: string | null;
  OcoTipo: string | null;
}
export interface OcorrenciaTipoResponse {
  data: OcorrenciaTipo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export const getAllOcorrenciaTipos = async (
  page = 1,
  limit = 10,
  searchString = "",
) => {
  const response = await api.get<OcorrenciaTipoResponse>(
    `/tipo-ocorrencia?page=${page}&limit=${limit}&search=${searchString}`,
  );
  return response.data;
};
export const createOcorrenciaTipo = async (data: Partial<OcorrenciaTipo>) => {
  const response = await api.post<OcorrenciaTipo>("/tipo-ocorrencia", data);
  return response.data;
};
export const updateOcorrenciaTipo = async (
  id: number,
  data: Partial<OcorrenciaTipo>,
) => {
  const response = await api.put<OcorrenciaTipo>(
    `/tipo-ocorrencia/${id}`,
    data,
  );
  return response.data;
};
export const deleteOcorrenciaTipo = async (id: number) => {
  await api.delete(`/tipo-ocorrencia/${id}`);
};