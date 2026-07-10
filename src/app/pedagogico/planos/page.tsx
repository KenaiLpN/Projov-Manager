"use client";
import { useState, useEffect, useCallback } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Pagination from "@/components/pagination";
import TabelaPlanoCurricular, {
  PlanoCurricular,
} from "@/components/tabelas/tabelaPlanoCurricular";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "react-hot-toast";

interface Plano {
  PlanCodigo: number;
  PlanDescricao: string | null;
  PlanCurso: string;
}

interface Disciplina {
  DisCodigo: number;
  DisDescricao: string;
}

interface Educador {
  EducCodigo: number;
  EducNome: string | null;
}

type FormData = {
  PlcCodigoPlano: number | "";
  PlcDisciplina: number | "";
  PlcOrdemDisciplina: number | "";
  PlcTipoAvaliacao: string;
  PlcGeraCronograma: string;
  PlcNumeroAulas: number | "";
  PlcCargaHoraria: number | "";
  EducCodigo: number | "";
  PlcDescricao: string;
};

const FORM_EMPTY: FormData = {
  PlcCodigoPlano: "",
  PlcDisciplina: "",
  PlcOrdemDisciplina: "",
  PlcTipoAvaliacao: "",
  PlcGeraCronograma: "",
  PlcNumeroAulas: "",
  PlcCargaHoraria: "",
  EducCodigo: "",
  PlcDescricao: "",
};

export default function PlanosPage() {
  const [lista, setLista] = useState<PlanoCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanoCurricular | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    codigoPlano: number;
    disciplina: number;
  } | null>(null);
  const [formData, setFormData] = useState<FormData>(FORM_EMPTY);

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [educadores, setEducadores] = useState<Educador[]>([]);

  const fetchData = useCallback(async (pagina: number, searchTerm = "") => {
    setLoading(true);
    try {
      const resp = await api.get(
        `/plano-curricular?page=${pagina}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`
      );
      setLista(resp.data.data);
      setTotalPages(resp.data.meta.totalPages);
      setError(null);
    } catch {
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSelects = useCallback(async () => {
    try {
      const [resPlanos, resDisciplinas, resEducadores] = await Promise.all([
        api.get("/planos?limit=1000"),
        api.get("/disciplinas?limit=1000"),
        api.get("/educadores?limit=1000"),
      ]);
      setPlanos(resPlanos.data.data || []);
      setDisciplinas(resDisciplinas.data.data || []);
      setEducadores(resEducadores.data.data || []);
    } catch {
      console.error("Erro ao carregar dados auxiliares.");
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  useEffect(() => {
    loadSelects();
  }, [loadSelects]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const openModalNew = () => {
    setEditingItem(null);
    setFormData(FORM_EMPTY);
    setIsModalOpen(true);
  };

  const handleEdit = (item: PlanoCurricular) => {
    setEditingItem(item);
    setFormData({
      PlcCodigoPlano: item.PlcCodigoPlano,
      PlcDisciplina: item.PlcDisciplina,
      PlcOrdemDisciplina: item.PlcOrdemDisciplina ?? "",
      PlcTipoAvaliacao: item.PlcTipoAvaliacao ?? "",
      PlcGeraCronograma: item.PlcGeraCronograma ?? "",
      PlcNumeroAulas: item.PlcNumeroAulas ?? "",
      PlcCargaHoraria: item.PlcCargaHoraria ?? "",
      EducCodigo: item.EducCodigo ?? "",
      PlcDescricao: item.PlcDescricao ?? "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (codigoPlano: number, disciplina: number) => {
    setItemToDelete({ codigoPlano, disciplina });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(
        `/plano-curricular/${itemToDelete.codigoPlano}/${itemToDelete.disciplina}`
      );
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const intFields = [
        "PlcCodigoPlano",
        "PlcDisciplina",
        "EducCodigo",
        "PlcOrdemDisciplina",
        "PlcNumeroAulas",
        "PlcCargaHoraria",
      ];
      setFormData((prev) => ({
        ...prev,
        [name]: intFields.includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value,
      }));
    },
    []
  );

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const requestSave = () => {
    if (editingItem) {
      setShowSaveConfirm(true);
    } else {
      handleSalvar();
    }
  };

  const handleSalvar = async () => {
    if (!formData.PlcCodigoPlano || !formData.PlcDisciplina) {
      toast.error("Plano Curricular e Disciplina são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(
          `/plano-curricular/${editingItem.PlcCodigoPlano}/${editingItem.PlcDisciplina}`,
          {
            PlcOrdemDisciplina: formData.PlcOrdemDisciplina === "" ? null : Number(formData.PlcOrdemDisciplina),
            PlcTipoAvaliacao: formData.PlcTipoAvaliacao || null,
            PlcGeraCronograma: formData.PlcGeraCronograma || null,
            PlcNumeroAulas: formData.PlcNumeroAulas === "" ? null : Number(formData.PlcNumeroAulas),
            PlcCargaHoraria: formData.PlcCargaHoraria === "" ? null : Number(formData.PlcCargaHoraria),
            EducCodigo: formData.EducCodigo === "" ? null : Number(formData.EducCodigo),
            PlcDescricao: formData.PlcDescricao || null,
          }
        );
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/plano-curricular", {
          PlcCodigoPlano: Number(formData.PlcCodigoPlano),
          PlcDisciplina: Number(formData.PlcDisciplina),
          PlcOrdemDisciplina: formData.PlcOrdemDisciplina === "" ? undefined : Number(formData.PlcOrdemDisciplina),
          PlcTipoAvaliacao: formData.PlcTipoAvaliacao || undefined,
          PlcGeraCronograma: formData.PlcGeraCronograma || undefined,
          PlcNumeroAulas: formData.PlcNumeroAulas === "" ? undefined : Number(formData.PlcNumeroAulas),
          PlcCargaHoraria: formData.PlcCargaHoraria === "" ? undefined : Number(formData.PlcCargaHoraria),
          EducCodigo: formData.EducCodigo === "" ? undefined : Number(formData.EducCodigo),
          PlcDescricao: formData.PlcDescricao || undefined,
        });
        toast.success("Cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      fetchData(page);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erro ao salvar."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto">
        {/* Barra de pesquisa */}
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-80 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#133c86] text-white font-semibold rounded hover:bg-[#0f2e6b] transition-colors cursor-pointer"
            >
              Pesquisar
            </button>
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#123A83] text-white font-semibold rounded-lg shadow-md hover:bg-[#0f2e6b] mr-4 cursor-pointer"
          >
            Novo Registro
          </button>
        </div>

        {/* Tabela */}
        <div className="flex-1">
          <TabelaPlanoCurricular
            dados={lista}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="p-4">
            {!loading && !error && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </div>

        {/* Modal de Cadastro / Edição */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold m-4 text-gray-800">
            {editingItem ? "Editar Plano Curricular" : "Novo Plano Curricular"}
          </h2>

          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Plano Curricular */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Plano Curricular <span className="text-red-500">*</span>
              </label>
              <select
                name="PlcCodigoPlano"
                value={formData.PlcCodigoPlano}
                onChange={handleChange}
                disabled={!!editingItem}
                className="p-2 rounded border border-gray-300 disabled:bg-gray-100"
              >
                <option value="">Selecione</option>
                {planos.map((p) => (
                  <option key={p.PlanCodigo} value={p.PlanCodigo}>
                    {p.PlanCodigo} — {p.PlanDescricao || p.PlanCurso}
                  </option>
                ))}
              </select>
            </div>

            {/* Disciplina */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Disciplina <span className="text-red-500">*</span>
              </label>
              <select
                name="PlcDisciplina"
                value={formData.PlcDisciplina}
                onChange={handleChange}
                disabled={!!editingItem}
                className="p-2 rounded border border-gray-300 disabled:bg-gray-100"
              >
                <option value="">Selecione</option>
                {disciplinas.map((d) => (
                  <option key={d.DisCodigo} value={d.DisCodigo}>
                    {d.DisDescricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Educador */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Educador</label>
              <select
                name="EducCodigo"
                value={formData.EducCodigo}
                onChange={handleChange}
                className="p-2 rounded border border-gray-300"
              >
                <option value="">Nenhum</option>
                {educadores.map((e) => (
                  <option key={e.EducCodigo} value={e.EducCodigo}>
                    {e.EducNome}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordem da Disciplina */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Ordem da Disciplina</label>
              <input
                type="number"
                name="PlcOrdemDisciplina"
                value={formData.PlcOrdemDisciplina}
                onChange={handleChange}
                min={1}
                className="p-2 rounded border border-gray-300"
              />
            </div>

            {/* Tipo de Avaliação */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Tipo de Avaliação</label>
              <select
                name="PlcTipoAvaliacao"
                value={formData.PlcTipoAvaliacao}
                onChange={handleChange}
                className="p-2 rounded border border-gray-300"
              >
                <option value="">Selecione</option>
                <option value="C">Conceito</option>
                <option value="N">Nota</option>
              </select>
            </div>

            {/* Gera Cronograma */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Gera Cronograma Automaticamente
              </label>
              <select
                name="PlcGeraCronograma"
                value={formData.PlcGeraCronograma}
                onChange={handleChange}
                className="p-2 rounded border border-gray-300"
              >
                <option value="">Selecione</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
              </select>
            </div>

            {/* Número de Aulas */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Número de Aulas</label>
              <input
                type="number"
                name="PlcNumeroAulas"
                value={formData.PlcNumeroAulas}
                onChange={handleChange}
                min={0}
                className="p-2 rounded border border-gray-300"
              />
            </div>

            {/* Carga Horária */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Carga Horária (h)</label>
              <input
                type="number"
                name="PlcCargaHoraria"
                value={formData.PlcCargaHoraria}
                onChange={handleChange}
                min={0}
                className="p-2 rounded border border-gray-300"
              />
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-sm font-semibold text-gray-600">Descrição</label>
              <input
                type="text"
                name="PlcDescricao"
                value={formData.PlcDescricao}
                onChange={handleChange}
                maxLength={50}
                className="p-2 rounded border border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={requestSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer"
            >
              {saving ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir este registro de plano curricular? Esta ação não pode ser desfeita."
        />
        <ConfirmModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          onConfirm={() => { setShowSaveConfirm(false); handleSalvar(); }}
          title="Confirmar Alteração"
          message="Deseja salvar as alterações neste registro?"
          confirmText="Salvar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}
