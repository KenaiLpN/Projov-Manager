import api from "./api";
import { CA_Aprendiz, CA_AprendizListResponse, CA_AprendizStats } from "@/types";

export const getAll = async (
  page = 1,
  limit = 10,
  search = "",
  filter = "",
  advancedFilter = "",
): Promise<CA_AprendizListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search)          params.append("search", search);
  if (filter)          params.append("filter", filter);
  if (advancedFilter)  params.append("advancedFilter", advancedFilter);
  const response = await api.get<CA_AprendizListResponse>(`/ca-aprendiz?${params}`);
  return response.data;
};

export const getStats = async (): Promise<CA_AprendizStats> => {
  const response = await api.get<CA_AprendizStats>("/ca-aprendiz/stats");
  return response.data;
};

export const getById = async (id: number): Promise<CA_Aprendiz> => {
  const response = await api.get<CA_Aprendiz>(`/ca-aprendiz/${id}`);
  return response.data;
};

export const create = async (data: Partial<CA_Aprendiz>): Promise<CA_Aprendiz> => {
  const response = await api.post<CA_Aprendiz>("/ca-aprendiz", data);
  return response.data;
};

export const update = async (id: number, data: Partial<CA_Aprendiz>): Promise<CA_Aprendiz> => {
  const response = await api.put<CA_Aprendiz>(`/ca-aprendiz/${id}`, data);
  return response.data;
};

export const remove = async (id: number): Promise<void> => {
  await api.delete(`/ca-aprendiz/${id}`);
};
