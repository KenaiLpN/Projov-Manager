"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/apiError";

interface Alocacao {
  ALAOrdem: number;
  ALAAprendiz: number;
  ALATurma: number;
  ALAUnidadeParceiro: number;
  ALAStatus: string | null;
  ALATutor: string | null;
  ALADataInicio: string | null;
  ALADataPrevTermino: string | null;
  ALADataTermino: string | null;
  ALAInicioExpediente: string | null;
  ALATerminoExpediente: string | null;
  ALAValorBolsa: number | null;
  ALAValorTaxa: number | null;
  ALAValorEncargos: number | null;
  ALAObservacao: string | null;
  ALApagto: string | null;
  ALAOrientador: number | null;
  ALAMotivoDesligamento: number | null;
  ALAAreaAtuacao: number | null;
  turmaNome: string | null;
  unidadeNome: string | null;
}

interface Unidade {
  ParUniCodigo: number;
  ParUniCodigoParceiro: number;
  ParUniDescricao: string;
  ParUniEndereco: string | null;
  ParUniNumeroEndereco: string | null;
  ParUniComplemento: string | null;
  ParUniBairro: string | null;
  ParUniCidade: string | null;
  ParUniEstado: string | null;
  ParUniEmail: string | null;
}

const EMPTY_FORM = {
  ALATurma: "",
  ALAUnidadeParceiro: "",
  ALAStatus: "A",
  ALATutor: "",
  ALADataInicio: "",
  ALADataPrevTermino: "",
  ALADataTermino: "",
  ALAInicioExpediente: "",
  ALATerminoExpediente: "",
  ALAValorBolsa: "0,00",
  ALAValorTaxa: "0,00",
  ALAValorEncargos: "0,00",
  ALAObservacao: "",
  ALApagto: "E",
  ALAOrientador: "",
  ALAMotivoDesligamento: "",
  ALAAreaAtuacao: "",
};

const STATUS_OPTIONS = [
  { value: "A", label: "Ativo" },
  { value: "I", label: "Inativo" },
];

const PAGTO_OPTIONS = [
  { value: "E", label: "Empresa" },
  { value: "C", label: "Projov" },
];

interface Props {
  aprendizId: number;
  aprendizNome: string;
  turmas: { TurCodigo?: number | null; TurNome?: string | null; TurCurso?: string | null }[];
  motivos: { MotCodigo?: number | null; MotDescricao?: string | null }[];
}

const parseBR = (v: string) =>
  parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

const formatBR = (v: string | number | null | undefined) => {
  const num =
    typeof v === "number"
      ? v
      : parseFloat(String(v ?? "0").replace(",", ".")) || 0;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function buildEndereco(u: Unidade | null): string {
  if (!u) return "";
  const parts = [
    u.ParUniEndereco,
    u.ParUniNumeroEndereco ? `nº ${u.ParUniNumeroEndereco}` : null,
    u.ParUniComplemento,
    u.ParUniBairro,
    u.ParUniCidade && u.ParUniEstado
      ? `${u.ParUniCidade} / ${u.ParUniEstado}`
      : u.ParUniCidade || u.ParUniEstado,
    u.ParUniEmail ? `E-mail: ${u.ParUniEmail}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

export function TabAlocacao({ aprendizId, aprendizNome, turmas, motivos }: Props) {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [cursos, setCursos] = useState<{ CurCodigo: string; CurDescricao: string }[]>([]);
  const [parceiros, setParceiros] = useState<{ ParCodigo: number; ParNomeFantasia: string | null; ParDescricao: string }[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [usuarios, setUsuarios] = useState<{ UsuCodigo: string; UsuNome: string }[]>([]);
  const [areas, setAreas] = useState<{ AreaCodigo: number; AreaDescricao: string | null }[]>([]);

  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedParceiro, setSelectedParceiro] = useState("");
  const [enderecoUnidade, setEnderecoUnidade] = useState("");

  const filteredTurmas = selectedCurso
    ? turmas.filter((t) => String(t.TurCurso ?? "") === selectedCurso)
    : turmas;

  const fetchAlocacoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ca-aprendiz/${aprendizId}/alocacoes`);
      setAlocacoes(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Erro ao carregar alocações.");
    } finally {
      setLoading(false);
    }
  }, [aprendizId]);

  useEffect(() => {
    fetchAlocacoes();
    Promise.allSettled([
      api.get("/cursos?limit=1000"),
      api.get("/parceiros?limit=1000"),
      api.get("/users?limit=1000"),
      api.get("/areas?limit=1000"),
    ]).then(([rCursos, rParceiros, rUsuarios, rAreas]) => {
      if (rCursos.status === "fulfilled") setCursos(rCursos.value.data?.data ?? []);
      if (rParceiros.status === "fulfilled") setParceiros(rParceiros.value.data?.data ?? []);
      if (rUsuarios.status === "fulfilled") setUsuarios(rUsuarios.value.data?.data ?? []);
      if (rAreas.status === "fulfilled") setAreas(rAreas.value.data?.data ?? []);
    });
  }, [fetchAlocacoes]);

  useEffect(() => {
    if (!selectedParceiro) {
      setUnidades([]);
      return;
    }
    api
      .get(`/unidades-parceiro?limit=1000&empresaId=${selectedParceiro}`)
      .then((r) => setUnidades(r.data?.data ?? []))
      .catch(() => setUnidades([]));
  }, [selectedParceiro]);

  useEffect(() => {
    const u = unidades.find((u) => String(u.ParUniCodigo) === form.ALAUnidadeParceiro) ?? null;
    setEnderecoUnidade(buildEndereco(u));
  }, [form.ALAUnidadeParceiro, unidades]);

  const hc = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = parseInt(raw || "0") / 100;
    setForm((prev) => ({ ...prev, [e.target.name]: formatBR(num) }));
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedCurso("");
    setSelectedParceiro("");
    setEnderecoUnidade("");
    setEditingOrdem(null);
    setShowForm(true);
  };

  const openEdit = async (a: Alocacao) => {
    const turma = turmas.find((t) => t.TurCodigo === a.ALATurma);
    setSelectedCurso(turma?.TurCurso ?? "");

    setForm({
      ALATurma: String(a.ALATurma),
      ALAUnidadeParceiro: String(a.ALAUnidadeParceiro),
      ALAStatus: a.ALAStatus ?? "A",
      ALATutor: a.ALATutor ?? "",
      ALADataInicio: a.ALADataInicio ?? "",
      ALADataPrevTermino: a.ALADataPrevTermino ?? "",
      ALADataTermino: a.ALADataTermino ?? "",
      ALAInicioExpediente: a.ALAInicioExpediente ?? "",
      ALATerminoExpediente: a.ALATerminoExpediente ?? "",
      ALAValorBolsa: formatBR(a.ALAValorBolsa),
      ALAValorTaxa: formatBR(a.ALAValorTaxa),
      ALAValorEncargos: formatBR(a.ALAValorEncargos),
      ALAObservacao: a.ALAObservacao ?? "",
      ALApagto: a.ALApagto ?? "E",
      ALAOrientador: a.ALAOrientador != null ? String(a.ALAOrientador) : "",
      ALAMotivoDesligamento: a.ALAMotivoDesligamento != null ? String(a.ALAMotivoDesligamento) : "",
      ALAAreaAtuacao: a.ALAAreaAtuacao != null ? String(a.ALAAreaAtuacao) : "",
    });

    setEditingOrdem(a.ALAOrdem);

    try {
      const allU = await api.get(`/unidades-parceiro?limit=1000`);
      const lista: Unidade[] = allU.data?.data ?? [];
      const thisU = lista.find((u) => u.ParUniCodigo === a.ALAUnidadeParceiro);
      if (thisU) {
        setSelectedParceiro(String(thisU.ParUniCodigoParceiro));
        const filtered = await api.get(
          `/unidades-parceiro?limit=1000&empresaId=${thisU.ParUniCodigoParceiro}`
        );
        setUnidades(filtered.data?.data ?? []);
      }
    } catch {}

    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.ALATurma || !form.ALAUnidadeParceiro) {
      toast.error("Turma e Unidade Parceiro são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        ALAValorBolsa: parseBR(form.ALAValorBolsa),
        ALAValorTaxa: parseBR(form.ALAValorTaxa),
        ALAValorEncargos: parseBR(form.ALAValorEncargos),
      };
      if (editingOrdem !== null) {
        await api.put(`/ca-aprendiz/alocacoes/${editingOrdem}`, payload);
        toast.success("Alocação atualizada.");
      } else {
        await api.post(`/ca-aprendiz/${aprendizId}/alocacoes`, payload);
        toast.success("Alocação criada.");
      }
      setShowForm(false);
      fetchAlocacoes();
    } catch (err: unknown) {
      console.error("ALOCACAO SAVE ERROR:", err);
      toast.error(getApiErrorMessage(err, "Erro ao salvar alocação."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ordem: number) => {
    if (!confirm("Deseja excluir esta alocação?")) return;
    try {
      await api.delete(`/ca-aprendiz/alocacoes/${ordem}`);
      toast.success("Alocação excluída.");
      fetchAlocacoes();
    } catch {
      toast.error("Erro ao excluir alocação.");
    }
  };

  const inputCls =
    "p-2 bg-white border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-200 w-full";
  const labelCls = "text-xs font-semibold text-gray-600 mb-1 block";

  if (showForm) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-700 border-b pb-2">
          Alocação de Aprendizes
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Matrícula / Aprendiz */}
          <div>
            <label className={labelCls}>Matrícula</label>
            <input value={aprendizId} readOnly className={`${inputCls} bg-gray-100`} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Aprendiz</label>
            <input value={aprendizNome} readOnly className={`${inputCls} bg-gray-100`} />
          </div>

          {/* Curso / Turma / Pagamento */}
          <div>
            <label className={labelCls}>Curso</label>
            <select
              value={selectedCurso}
              onChange={(e) => {
                setSelectedCurso(e.target.value);
                setForm((p) => ({ ...p, ALATurma: "" }));
              }}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {cursos.map((c) => (
                <option key={c.CurCodigo} value={c.CurCodigo}>
                  {c.CurDescricao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Turma</label>
            <select name="ALATurma" value={form.ALATurma} onChange={hc} className={inputCls}>
              <option value="">Selecione</option>
              {filteredTurmas.map((t) => (
                <option key={t.TurCodigo ?? ""} value={t.TurCodigo ?? ""}>
                  {t.TurNome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tipo de Pagamento</label>
            <select name="ALApagto" value={form.ALApagto} onChange={hc} className={inputCls}>
              {PAGTO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parceiro / Unidade */}
          <div className="col-span-2">
            <label className={labelCls}>Parceiro</label>
            <select
              value={selectedParceiro}
              onChange={(e) => {
                setSelectedParceiro(e.target.value);
                setForm((p) => ({ ...p, ALAUnidadeParceiro: "" }));
                setEnderecoUnidade("");
              }}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {parceiros.map((p) => (
                <option key={p.ParCodigo} value={p.ParCodigo}>
                  {p.ParNomeFantasia || p.ParDescricao} - {p.ParCodigo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Unidade</label>
            <select
              name="ALAUnidadeParceiro"
              value={form.ALAUnidadeParceiro}
              onChange={hc}
              className={inputCls}
              disabled={!selectedParceiro}
            >
              <option value="">Selecione</option>
              {unidades.map((u) => (
                <option key={u.ParUniCodigo} value={u.ParUniCodigo}>
                  {u.ParUniDescricao} - {u.ParUniCodigo}
                </option>
              ))}
            </select>
          </div>

          {/* Endereço da Unidade */}
          <div className="col-span-3">
            <label className={labelCls}>Endereço da Unidade</label>
            <textarea
              value={enderecoUnidade}
              readOnly
              rows={3}
              className={`${inputCls} bg-gray-50 resize-none`}
            />
          </div>

          {/* Acompanhamento / Área / Supervisor */}
          <div>
            <label className={labelCls}>Acompanhamento na Empresa</label>
            <select name="ALATutor" value={form.ALATutor} onChange={hc} className={inputCls}>
              <option value="">Selecione</option>
              {usuarios.map((u) => (
                <option key={u.UsuCodigo} value={u.UsuCodigo}>
                  {u.UsuNome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Área de Atuação</label>
            <select name="ALAAreaAtuacao" value={form.ALAAreaAtuacao} onChange={hc} className={inputCls}>
              <option value="">Selecione</option>
              {areas.map((a) => (
                <option key={a.AreaCodigo} value={a.AreaCodigo}>
                  {a.AreaDescricao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Supervisor</label>
            <select name="ALAOrientador" value={form.ALAOrientador} onChange={hc} className={inputCls}>
              <option value="">Selecione</option>
            </select>
          </div>

          {/* Expediente / Datas / Status — 6 colunas */}
          <div className="col-span-3 grid grid-cols-6 gap-4">
            <div>
              <label className={labelCls}>Início Expediente</label>
              <input type="time" name="ALAInicioExpediente" value={form.ALAInicioExpediente} onChange={hc} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Término Expediente</label>
              <input type="time" name="ALATerminoExpediente" value={form.ALATerminoExpediente} onChange={hc} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Data Início</label>
              <input type="date" name="ALADataInicio" value={form.ALADataInicio} onChange={hc} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Previsão Término</label>
              <input type="date" name="ALADataPrevTermino" value={form.ALADataPrevTermino} onChange={hc} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Data Término</label>
              <input type="date" name="ALADataTermino" value={form.ALADataTermino} onChange={hc} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="ALAStatus" value={form.ALAStatus} onChange={hc} className={inputCls}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valores / Motivo — 4 colunas */}
          <div className="col-span-3 grid grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Salário</label>
              <input
                type="text"
                name="ALAValorBolsa"
                value={form.ALAValorBolsa}
                onChange={handleCurrencyChange}
                inputMode="numeric"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Contribuição</label>
              <input
                type="text"
                name="ALAValorTaxa"
                value={form.ALAValorTaxa}
                onChange={handleCurrencyChange}
                inputMode="numeric"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Valor Encargos</label>
              <input
                type="text"
                name="ALAValorEncargos"
                value={form.ALAValorEncargos}
                onChange={handleCurrencyChange}
                inputMode="numeric"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Motivo de Desligamento</label>
              <select name="ALAMotivoDesligamento" value={form.ALAMotivoDesligamento} onChange={hc} className={inputCls}>
                <option value="">Selecione</option>
                {motivos.map((m) => (
                  <option key={m.MotCodigo ?? ""} value={m.MotCodigo ?? ""}>
                    {m.MotDescricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="col-span-3">
            <label className={labelCls}>Observações</label>
            <textarea
              name="ALAObservacao"
              value={form.ALAObservacao}
              onChange={hc}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#133c86] text-white rounded font-semibold hover:bg-[#0f2e6b] disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvando..." : "Confirmar"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Alocações</h3>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#133c86] text-white rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] transition-colors"
        >
          <Plus size={14} /> Nova Alocação
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Carregando alocações...</p>
      ) : alocacoes.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Nenhuma alocação registrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["#", "Turma", "Unidade Parceiro", "Status", "Início", "Prev. Término", "Término", "Salário", "Ações"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alocacoes.map((a) => (
                <tr key={a.ALAOrdem} className="hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2 text-gray-500">{a.ALAOrdem}</td>
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{a.turmaNome ?? a.ALATurma}</td>
                  <td className="px-3 py-2 text-gray-700 max-w-[200px] truncate">{a.unidadeNome ?? a.ALAUnidadeParceiro}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.ALAStatus === "A" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {a.ALAStatus ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{a.ALADataInicio ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{a.ALADataPrevTermino ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{a.ALADataTermino ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {a.ALAValorBolsa != null ? `R$ ${formatBR(a.ALAValorBolsa)}` : "—"}
                  </td>
                  <td className="px-3 py-2 flex gap-1">
                    <button onClick={() => openEdit(a)} title="Editar" className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(a.ALAOrdem)} title="Excluir" className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
