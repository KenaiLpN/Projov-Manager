import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { validatePaginatedResponse } from "@/utils/apiResponse";
interface UseCrudOptions {
  endpoint: string;
  limit?: number;
}
export function useCrud<T, FormType = object>({ endpoint, limit = 10 }: UseCrudOptions) {
  const [lista, setLista] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | string | null>(
    null,
  );
  const [deleting, setDeleting] = useState<boolean>(false);
  const requestVersion = useRef(0);
  const fetchData = useCallback(
    async (pagina: number, searchTerm: string = "") => {
      const version = ++requestVersion.current;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(pagina),
          limit: String(limit),
        });
        if (searchTerm) {
          queryParams.append("search", searchTerm); 
        }
        const response = await api.get(`${endpoint}?${queryParams.toString()}`);
        const data = validatePaginatedResponse(response.data);
        if (version !== requestVersion.current) return;
        setLista(data.data);
        setTotalPages(Math.max(1, data.meta.totalPages));
        setError(null);
      } catch (err) {
        if (version !== requestVersion.current) return;
        setError(getApiErrorMessage(err, "Falha ao carregar dados."));
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [endpoint, limit],
  );
  // Ref para sempre apontar para a versão mais recente de fetchData,
  // evitando que a função entre nas dependências do useEffect de debounce
  // e cause re-execuções desnecessárias.
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  useEffect(() => {
    const timer = setTimeout(() => fetchDataRef.current(page, search), 500);
    return () => clearTimeout(timer);
  }, [page, search]);
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: unknown) {
      console.error(`Erro ao excluir ${endpoint}:`, err);
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };
  const handleSalvar = async (id: number | string | null, data: FormType) => {
    setSaving(true);
    try {
      if (id) {
        await api.put(`${endpoint}/${id}`, data);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post(endpoint, data);
        toast.success("Cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchData(page);
      return true;
    } catch (err: unknown) {
      console.error(`Erro ao salvar ${endpoint}:`, err);
      toast.error(getApiErrorMessage(err, "Erro ao salvar."));
      return false;
    } finally {
      setSaving(false);
    }
  };
  const resetFormAndLoad = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };
  return {
    lista,
    loading,
    error,
    page,
    totalPages,
    search,
    isModalOpen,
    editingId,
    saving,
    isConfirmOpen,
    itemToDelete,
    deleting,
    setPage,
    setSearch,
    setIsModalOpen,
    setEditingId,
    setIsConfirmOpen,
    setItemToDelete,
    fetchData,
    confirmDelete,
    handleSalvar,
    resetFormAndLoad,
  };
}
