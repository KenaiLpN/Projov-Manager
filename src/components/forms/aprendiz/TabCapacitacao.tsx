"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/apiError";

interface Capacitacao {
  CapSequencia: number;
  CapAprendiz: number;
  CapTurma: number;
  CapStatus: string;
  CapUnidade: number;
  CapDataInicio: string | null;
  CapDataPrevTermino: string | null;
  CapDataTermino: string | null;
  CapObservacoes: string | null;
  unidadeNome: string | null;
}

const EMPTY_FORM = {
  CapTurma: "",
  CapUnidade: "",
  CapStatus: "A",
  CapDataInicio: "",
  CapDataPrevTermino: "",
  CapDataTermino: "",
  CapObservacoes: "",
};

type CapacitacaoForm = typeof EMPTY_FORM;

interface Props {
  aprendizId: number;
  turmas: { cod: number; nome: string }[];
  unidades: { UniCodigo: number; UniNome: string }[];
}

export function TabCapacitacao({ aprendizId, turmas, unidades }: Props) {
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeq, setEditingSeq] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchCapacitacoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ca-aprendiz/${aprendizId}/capacitacoes`);
      setCapacitacoes(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Erro ao carregar capacitações.");
    } finally {
      setLoading(false);
    }
  }, [aprendizId]);

  useEffect(() => {
    fetchCapacitacoes();
  }, [fetchCapacitacoes]);

  const hc = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingSeq(null);
    setShowForm(true);
  };

  const openEdit = (c: Capacitacao) => {
    setForm({
      CapTurma:           String(c.CapTurma),
      CapUnidade:         String(c.CapUnidade),
      CapStatus:          c.CapStatus ?? "A",
      CapDataInicio:      c.CapDataInicio ?? "",
      CapDataPrevTermino: c.CapDataPrevTermino ?? "",
      CapDataTermino:     c.CapDataTermino ?? "",
      CapObservacoes:     c.CapObservacoes ?? "",
    });
    setEditingSeq(c.CapSequencia);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.CapTurma || !form.CapUnidade || !form.CapDataInicio) {
      toast.error("Turma, Unidade e Data Início são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingSeq !== null) {
        await api.put(`/ca-aprendiz/capacitacoes/${editingSeq}`, form);
        toast.success("Capacitação atualizada.");
      } else {
        await api.post(`/ca-aprendiz/${aprendizId}/capacitacoes`, form);
        toast.success("Capacitação criada.");
      }
      setShowForm(false);
      fetchCapacitacoes();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Erro ao salvar capacitação."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (seq: number) => {
    if (!confirm("Deseja excluir esta capacitação?")) return;
    try {
      await api.delete(`/ca-aprendiz/capacitacoes/${seq}`);
      toast.success("Capacitação excluída.");
      fetchCapacitacoes();
    } catch {
      toast.error("Erro ao excluir capacitação.");
    }
  };

  const Field = ({ label, name, type = "text" }: { label: string; name: keyof CapacitacaoForm; type?: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={hc}
        className="p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Capacitações</h3>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#133c86] text-white rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] transition-colors">
          <Plus size={14} /> Nova Capacitação
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[#133c86] text-sm">{editingSeq ? "Editar Capacitação" : "Nova Capacitação"}</span>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-500" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Turma *</label>
              <select name="CapTurma" value={form.CapTurma} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Selecione...</option>
                {turmas.map(t => <option key={t.cod} value={t.cod}>{t.nome}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Unidade *</label>
              <select name="CapUnidade" value={form.CapUnidade} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Selecione...</option>
                {unidades.map(u => <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <select name="CapStatus" value={form.CapStatus} onChange={hc} className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>

            <Field label="Data Início *" name="CapDataInicio" type="date" />
            <Field label="Data Prev. Término" name="CapDataPrevTermino" type="date" />
            <Field label="Data Término" name="CapDataTermino" type="date" />

            <div className="flex flex-col gap-1 lg:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase">Observações</label>
              <textarea name="CapObservacoes" value={form.CapObservacoes} onChange={hc} rows={2}
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

      {loading ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Carregando capacitações...</p>
      ) : capacitacoes.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-8">Nenhuma capacitação registrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["#", "Turma", "Unidade", "Status", "Data Início", "Prev. Término", "Data Término", "Ações"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {capacitacoes.map(c => (
                <tr key={c.CapSequencia} className="hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2 text-gray-500">{c.CapSequencia}</td>
                  <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                    {turmas.find(t => t.cod === c.CapTurma)?.nome ?? c.CapTurma}
                  </td>
                  <td className="px-3 py-2 text-gray-700 max-w-[200px] truncate">
                    {c.unidadeNome ?? c.CapUnidade}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.CapStatus === "A" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {c.CapStatus === "A" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.CapDataInicio ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.CapDataPrevTermino ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.CapDataTermino ?? "—"}</td>
                  <td className="px-3 py-2 flex gap-1">
                    <button onClick={() => openEdit(c)} title="Editar" className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.CapSequencia)} title="Excluir" className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors">
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
