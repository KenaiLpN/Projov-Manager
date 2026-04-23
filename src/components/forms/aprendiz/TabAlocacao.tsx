"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import api from "@/services/api";

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
  turmaNome: string | null;
  unidadeNome: string | null;
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
  ALAValorBolsa: "",
  ALAValorTaxa: "",
  ALAValorEncargos: "",
  ALAObservacao: "",
  ALApagto: "",
  ALAOrientador: "",
  ALAMotivoDesligamento: "",
};

const STATUS_OPTIONS = [
  { value: "A", label: "A - Ativo" },
  { value: "D", label: "D - Desligado" },
  { value: "F", label: "F - Férias" },
  { value: "S", label: "S - Suspenso" },
];

const PAGTO_OPTIONS = [
  { value: "B", label: "B - Boleto" },
  { value: "D", label: "D - Débito" },
  { value: "T", label: "T - Transferência" },
];

interface Props {
  aprendizId: number;
  turmas: { TurCodigo: number; TurNome: string }[];
  motivos: { MdaCodigo: number; MdaDescricao: string }[];
}

export function TabAlocacao({ aprendizId, turmas, motivos }: Props) {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [unidades, setUnidades] = useState<{ ParUniCodigo: number; ParUniDescricao: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

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
    api.get("/unidades-parceiro?limit=1000")
      .then(r => setUnidades(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {});
  }, [fetchAlocacoes]);

  const hc = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingOrdem(null);
    setShowForm(true);
  };

  const openEdit = (a: Alocacao) => {
    setForm({
      ALATurma:             String(a.ALATurma),
      ALAUnidadeParceiro:   String(a.ALAUnidadeParceiro),
      ALAStatus:            a.ALAStatus            ?? "",
      ALATutor:             a.ALATutor             ?? "",
      ALADataInicio:        a.ALADataInicio         ?? "",
      ALADataPrevTermino:   a.ALADataPrevTermino    ?? "",
      ALADataTermino:       a.ALADataTermino        ?? "",
      ALAInicioExpediente:  a.ALAInicioExpediente   ?? "",
      ALATerminoExpediente: a.ALATerminoExpediente  ?? "",
      ALAValorBolsa:        a.ALAValorBolsa         != null ? String(a.ALAValorBolsa)  : "",
      ALAValorTaxa:         a.ALAValorTaxa          != null ? String(a.ALAValorTaxa)   : "",
      ALAValorEncargos:     a.ALAValorEncargos      != null ? String(a.ALAValorEncargos) : "",
      ALAObservacao:        a.ALAObservacao         ?? "",
      ALApagto:             a.ALApagto              ?? "",
      ALAOrientador:        a.ALAOrientador         != null ? String(a.ALAOrientador) : "",
      ALAMotivoDesligamento: a.ALAMotivoDesligamento != null ? String(a.ALAMotivoDesligamento) : "",
    });
    setEditingOrdem(a.ALAOrdem);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.ALATurma || !form.ALAUnidadeParceiro) {
      toast.error("Turma e Unidade Parceiro são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingOrdem !== null) {
        await api.put(`/ca-aprendiz/alocacoes/${editingOrdem}`, form);
        toast.success("Alocação atualizada.");
      } else {
        await api.post(`/ca-aprendiz/${aprendizId}/alocacoes`, form);
        toast.success("Alocação criada.");
      }
      setShowForm(false);
      fetchAlocacoes();
    } catch {
      toast.error("Erro ao salvar alocação.");
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

  const Field = ({ label, name, type = "text", children }: { label: string; name: string; type?: string; children?: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      {children ?? (
        <input
          type={type}
          name={name}
          value={(form as any)[name]}
          onChange={hc}
          className="p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm"
        />
      )}
    </div>
  );

  const Sel = ({ label, name, options }: { label: string; name: string; options: { value: string; label: string }[] }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <select name={name} value={(form as any)[name]} onChange={hc} className="p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm">
        <option value="">Selecione...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Alocações</h3>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#133c86] text-white rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] transition-colors">
          <Plus size={14} /> Nova Alocação
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[#133c86] text-sm">{editingOrdem ? "Editar Alocação" : "Nova Alocação"}</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-500" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Turma */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Turma *</label>
              <select name="ALATurma" value={form.ALATurma} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Selecione...</option>
                {turmas.map(t => <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>)}
              </select>
            </div>

            {/* Unidade Parceiro */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Unidade Parceiro *</label>
              <select name="ALAUnidadeParceiro" value={form.ALAUnidadeParceiro} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Selecione...</option>
                {unidades.map(u => <option key={u.ParUniCodigo} value={u.ParUniCodigo}>{u.ParUniDescricao}</option>)}
              </select>
            </div>

            <Sel label="Status" name="ALAStatus" options={STATUS_OPTIONS} />
            <Field label="Tutor" name="ALATutor" />
            <Field label="Data Início" name="ALADataInicio" type="date" />
            <Field label="Prev. Término" name="ALADataPrevTermino" type="date" />
            <Field label="Data Término" name="ALADataTermino" type="date" />
            <Field label="Início Expediente" name="ALAInicioExpediente" type="time" />
            <Field label="Término Expediente" name="ALATerminoExpediente" type="time" />
            <Field label="Valor Bolsa (R$)" name="ALAValorBolsa" type="number" />
            <Field label="Valor Taxa (R$)" name="ALAValorTaxa" type="number" />
            <Field label="Valor Encargos (R$)" name="ALAValorEncargos" type="number" />
            <Sel label="Pagamento" name="ALApagto" options={PAGTO_OPTIONS} />
            <Field label="Orientador (cód.)" name="ALAOrientador" type="number" />

            {/* Motivo Desligamento */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Motivo Desligamento</label>
              <select name="ALAMotivoDesligamento" value={form.ALAMotivoDesligamento} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Selecione...</option>
                {motivos.map((m: any) => <option key={m.MdaCodigo} value={m.MdaCodigo}>{m.MdaDescricao}</option>)}
              </select>
            </div>

            {/* Observação (full width) */}
            <div className="flex flex-col gap-1 lg:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase">Observação</label>
              <textarea name="ALAObservacao" value={form.ALAObservacao} onChange={hc} rows={2}
                className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-[#133c86] text-white rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] transition-colors disabled:opacity-50">
              <Check size={14} /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Carregando alocações...</p>
      ) : alocacoes.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Nenhuma alocação registrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["#", "Turma", "Unidade Parceiro", "Status", "Início", "Prev. Término", "Término", "Bolsa", "Ações"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alocacoes.map(a => (
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
                    {a.ALAValorBolsa != null ? `R$ ${Number(a.ALAValorBolsa).toFixed(2)}` : "—"}
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
