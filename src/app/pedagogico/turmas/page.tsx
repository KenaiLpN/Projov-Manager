"use client";
import { useState, useEffect, useCallback } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/apiError";
import TabelaTurmas, { Turma } from "@/components/tabelas/tabelaturmas";
import Pagination from "@/components/pagination";
import { toast } from "react-hot-toast";

interface Curso {
  CurCodigo: string;
  CurDescricao: string;
}

interface Educador {
  EducCodigo: number;
  EducNome: string | null;
}

interface Plano {
  PlanCodigo: number;
  PlanDescricao: string | null;
  PlanCurso: string;
}

interface Unidade {
  UniCodigo: number;
  UniNome: string | null;
}

type FormData = {
  TurCurso: string;
  TurNome: string;
  TurDiaSemana: string;
  TurDiaSemana02: string;
  TurSemanaEncontro: string;
  TurInicio: string;
  Termino: string;
  TurObservacoes: string;
  TurStatus: string;
  TurPlanoCurricular: number | "";
  TurUnidade: number | "";
  TurNumeroMeses: number | "";
  TurEducadorResponsavel: number | "";
  TurEducadorInformatica: number | "";
};

const FORM_EMPTY: FormData = {
  TurCurso: "",
  TurNome: "",
  TurDiaSemana: "",
  TurDiaSemana02: "",
  TurSemanaEncontro: "",
  TurInicio: "",
  Termino: "",
  TurObservacoes: "",
  TurStatus: "A",
  TurPlanoCurricular: "",
  TurUnidade: "",
  TurNumeroMeses: "",
  TurEducadorResponsavel: "",
  TurEducadorInformatica: "",
};

const INT_FIELDS = [
  "TurPlanoCurricular",
  "TurUnidade",
  "TurNumeroMeses",
  "TurEducadorResponsavel",
  "TurEducadorInformatica",
];

/** Extrai "HH:mm" de uma string ISO datetime (ex: "1970-01-01T08:00:00.000Z" → "08:00") */
function extractTime(val: string | null): string {
  if (!val) return "";
  const t = val.includes("T") ? val.split("T")[1] : val;
  return t.slice(0, 5);
}

/** Converte "HH:mm" para string ISO compatível com z.coerce.date() */
function timeToISO(val: string): string | null {
  if (!val) return null;
  return `1970-01-01T${val}:00`;
}

export default function TurmasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<FormData>(FORM_EMPTY);

  // Dados de seleção
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [educadores, setEducadores] = useState<Educador[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);

  // Planos filtrados pelo curso selecionado
  const filteredPlanos = formData.TurCurso
    ? planos.filter((p) => p.PlanCurso === formData.TurCurso)
    : planos;

  const fetchData = useCallback(async (pagina: number, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await api.get(
        `/turmas?page=${pagina}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`,
      );
      setLista(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setError(null);
    } catch {
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSelects = useCallback(async () => {
    try {
      const [resCursos, resEducadores, resPlanos, resUnidades] =
        await Promise.allSettled([
          api.get("/cursos?limit=1000"),
          api.get("/educadores?limit=1000"),
          api.get("/planos?limit=1000"),
          api.get("/unidade?limit=1000"),
        ]);

      console.log("[loadSelects] cursos:", resCursos);
      console.log("[loadSelects] educadores:", resEducadores);
      console.log("[loadSelects] planos:", resPlanos);
      console.log("[loadSelects] unidades:", resUnidades);

      if (resCursos.status === "fulfilled") setCursos(resCursos.value.data.data || []);
      if (resEducadores.status === "fulfilled") setEducadores(resEducadores.value.data.data || []);
      if (resPlanos.status === "fulfilled") setPlanos(resPlanos.value.data.data || []);
      if (resUnidades.status === "fulfilled") setUnidades(resUnidades.value.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares:", err);
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };

  const openModalNew = () => {
    setEditingId(null);
    setFormData(FORM_EMPTY);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Turma) => {
    setEditingId(item.TurCodigo);
    setFormData({
      TurCurso: item.TurCurso ?? "",
      TurNome: item.TurNome ?? "",
      TurDiaSemana: item.TurDiaSemana ?? "",
      TurDiaSemana02: item.TurDiaSemana02 ?? "",
      TurSemanaEncontro: item.TurSemanaEncontro ?? "",
      TurInicio: extractTime(item.TurInicio),
      Termino: extractTime(item.Termino),
      TurObservacoes: item.TurObservacoes ?? "",
      TurStatus: item.TurStatus ?? "A",
      TurPlanoCurricular: item.TurPlanoCurricular ?? "",
      TurUnidade: item.TurUnidade ?? "",
      TurNumeroMeses: item.TurNumeroMeses ?? "",
      TurEducadorResponsavel: item.TurEducadorResponsavel ?? "",
      TurEducadorInformatica: item.TurEducadorInformatica ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: INT_FIELDS.includes(name)
          ? value === ""
            ? ""
            : Number(value)
          : value,
      }));
    },
    [],
  );

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/turmas/${itemToDelete}`);
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

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const requestSave = () => {
    if (editingId) {
      setShowSaveConfirm(true);
    } else {
      handleSalvar();
    }
  };

  const handleSalvar = async () => {
    if (!formData.TurPlanoCurricular) {
      toast.error("O Plano Curricular é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        TurCurso: formData.TurCurso || null,
        TurNome: formData.TurNome || null,
        TurDiaSemana: formData.TurDiaSemana || null,
        TurDiaSemana02: formData.TurDiaSemana02 || null,
        TurSemanaEncontro: formData.TurSemanaEncontro || null,
        TurInicio: timeToISO(formData.TurInicio),
        Termino: timeToISO(formData.Termino),
        TurObservacoes: formData.TurObservacoes || null,
        TurStatus: formData.TurStatus || "A",
        TurPlanoCurricular: Number(formData.TurPlanoCurricular),
        TurUnidade: formData.TurUnidade === "" ? null : Number(formData.TurUnidade),
        TurNumeroMeses: formData.TurNumeroMeses === "" ? null : Number(formData.TurNumeroMeses),
        TurEducadorResponsavel: formData.TurEducadorResponsavel === "" ? null : Number(formData.TurEducadorResponsavel),
        TurEducadorInformatica: formData.TurEducadorInformatica === "" ? null : Number(formData.TurEducadorInformatica),
      };

      if (editingId) {
        await api.put(`/turmas/${editingId}`, payload);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/turmas", payload);
        toast.success("Cadastrado com sucesso!");
      }
      closeModal();
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
                placeholder="Buscar por nome ou curso..."
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
            Nova Turma
          </button>
        </div>

        {/* Tabela */}
        <div className="flex-1">
          <TabelaTurmas
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
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-bold m-4 text-gray-800">
            {editingId ? "Editar Turma" : "Nova Turma"}
          </h2>

          <div className="p-4 grid grid-cols-2 gap-4 ">

            {/* Código da Turma (somente leitura) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Código da Turma
              </label>
              <input
                type="text"
                value={editingId ?? "Gerado automaticamente"}
                disabled
                className="p-2 w-full rounded border border-gray-300 bg-gray-100 text-gray-500"
              />
            </div>

            {/* Nome da Turma */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome da Turma
              </label>
              <input
                name="TurNome"
                value={formData.TurNome}
                onChange={handleChange}
                type="text"
                maxLength={40}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            {/* Curso */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Curso <span className="text-red-500">*</span>
              </label>
              <select
                name="TurCurso"
                value={formData.TurCurso}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                {cursos.map((c) => (
                  <option key={c.CurCodigo} value={c.CurCodigo}>
                    {c.CurCodigo} — {c.CurDescricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Plano Curricular (filtrado pelo curso) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Plano Curricular <span className="text-red-500">*</span>
              </label>
              <select
                name="TurPlanoCurricular"
                value={formData.TurPlanoCurricular}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                {filteredPlanos.map((p) => (
                  <option key={p.PlanCodigo} value={p.PlanCodigo}>
                    {p.PlanCodigo} — {p.PlanDescricao || p.PlanCurso}
                  </option>
                ))}
              </select>
              {formData.TurCurso && filteredPlanos.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhum plano vinculado a este curso.
                </p>
              )}
            </div>

            {/* Unidade */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Unidade
              </label>
              <select
                name="TurUnidade"
                value={formData.TurUnidade}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                {unidades.map((u) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>
                    {u.UniNome || `Unidade ${u.UniCodigo}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Status
              </label>
              <select
                name="TurStatus"
                value={formData.TurStatus}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>

            {/* Educador Responsável */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Educador Responsável
              </label>
              <select
                name="TurEducadorResponsavel"
                value={formData.TurEducadorResponsavel}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                {educadores.map((e) => (
                  <option key={e.EducCodigo} value={e.EducCodigo}>
                    {e.EducNome || `Educador ${e.EducCodigo}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Educador Informática */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Educador Informática
              </label>
              <select
                name="TurEducadorInformatica"
                value={formData.TurEducadorInformatica}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                {educadores.map((e) => (
                  <option key={e.EducCodigo} value={e.EducCodigo}>
                    {e.EducNome || `Educador ${e.EducCodigo}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Dia da Semana */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Dia da Semana
              </label>
              <select
                name="TurDiaSemana"
                value={formData.TurDiaSemana}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                <option value="1">Segunda à Sexta</option>
                <option value="2">Segunda-Feira</option>
                <option value="3">Terça-Feira</option>
                <option value="4">Quarta-Feira</option>
                <option value="5">Quinta-Feira</option>
                <option value="6">Sexta-Feira</option>
              </select>
            </div>

            {/* Dia do Encontro Semanal */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Dia do Encontro Semanal
              </label>
              <select
                name="TurDiaSemana02"
                value={formData.TurDiaSemana02}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                <option value="1">Domingo</option>
                <option value="2">Segunda-Feira</option>
                <option value="3">Terça-Feira</option>
                <option value="4">Quarta-Feira</option>
                <option value="5">Quinta-Feira</option>
                <option value="6">Sexta-Feira</option>
                <option value="7">Sábado</option>
              </select>
            </div>

            {/* Semana do Encontro */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Semana do Encontro
              </label>
              <select
                name="TurSemanaEncontro"
                value={formData.TurSemanaEncontro}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300"
              >
                <option value="">Selecione...</option>
                <option value="1">1ª Semana</option>
                <option value="2">2ª Semana</option>
                <option value="3">3ª Semana</option>
                <option value="4">4ª Semana</option>
              </select>
            </div>

            {/* Número de Meses */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Número de Meses
              </label>
              <input
                name="TurNumeroMeses"
                value={formData.TurNumeroMeses}
                onChange={handleChange}
                type="number"
                min={1}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            {/* Hora Início */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Hora Início
              </label>
              <input
                name="TurInicio"
                value={formData.TurInicio}
                onChange={handleChange}
                type="time"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            {/* Hora Término */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Hora Término
              </label>
              <input
                name="Termino"
                value={formData.Termino}
                onChange={handleChange}
                type="time"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            {/* Observações */}
            <div className="flex flex-col col-span-2 gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Observações
              </label>
              <textarea
                name="TurObservacoes"
                value={formData.TurObservacoes}
                onChange={handleChange}
                maxLength={255}
                rows={3}
                className="p-2 w-full rounded border border-gray-300 h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
            <button
              onClick={closeModal}
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

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita."
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
