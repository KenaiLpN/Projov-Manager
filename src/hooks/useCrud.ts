import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
interface UseCrudOptions {
  endpoint: string;
}
export function useCrud<T, FormType = any>({ endpoint }: UseCrudOptions) {
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
  const fetchData = useCallback(
    async (pagina: number, searchTerm: string = search) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(pagina),
          limit: "10",
        });
        if (searchTerm) {
          queryParams.append("search", searchTerm); 
        }
        const response = await api.get(`${endpoint}?${queryParams.toString()}`);
        setLista(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setError(null);
      } catch (err) {
        console.error(`Erro ao buscar ${endpoint}:`, err);
        setError("Falha ao carregar dados.");
        setLista([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, search],
  );
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(page, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, fetchData]);
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: any) {
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
    } catch (err: any) {
      console.error(`Erro ao salvar ${endpoint}:`, err);
      const msg = err.response?.data?.message || "Erro ao salvar.";
      toast.error(msg);
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