"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";

type Vaga = { ReqId: number; ReqAreaAtuacao: number; ReqQuantidade: number; ReqSituacao?: string; ReqSexo?: string; ReqDataSolita__o?: string; ReqAtividades?: string };
type Area = { AreaCodigo: number; AreaDescricao: string | null };

export default function CadastroVagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ReqAreaAtuacao: "", ReqQuantidade: "1", ReqSexo: "A", ReqDataSolita__o: new Date().toISOString().slice(0, 10), ReqSubstituicao: "N", ReqSituacao: "A", ReqAtividades: "", ReqHabilidades: "", ReqHorarioTrabalho: "" });

  const load = useCallback(async (term = "") => {
    setLoading(true);
    try {
      const [vagaRes, areaRes] = await Promise.all([api.get("/empresa/vagas", { params: { limit: 100, search: term || undefined } }), api.get("/empresa/vagas/areas")]);
      setVagas(vagaRes.data.data ?? []);
      setAreas(areaRes.data ?? []);
    } catch { toast.error("Nao foi possivel carregar as vagas."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.ReqAreaAtuacao) return toast.error("Selecione a area de atuacao.");
    setSaving(true);
    try {
      await api.post("/empresa/vagas", {
        ...form,
        ReqAreaAtuacao: Number(form.ReqAreaAtuacao),
        ReqQuantidade: Number(form.ReqQuantidade),
        ReqAtividades: form.ReqAtividades || null,
        ReqHabilidades: form.ReqHabilidades || null,
        ReqHorarioTrabalho: form.ReqHorarioTrabalho || null,
      });
      toast.success("Vaga cadastrada com sucesso.");
      setOpen(false);
      await load(search);
    } catch { toast.error("Nao foi possivel cadastrar a vaga."); }
    finally { setSaving(false); }
  }

  const areaName = (id: number) => areas.find((area) => area.AreaCodigo === id)?.AreaDescricao || `Area ${id}`;
  return <ParceiroPageShell><div className="min-h-full bg-gray-100 p-6">
    <header className="mx-auto mb-5 flex max-w-7xl items-center justify-between rounded-xl bg-[#133c86] px-6 py-5 text-white">
      <div className="flex items-center gap-3"><Briefcase /><div><h1 className="text-2xl font-bold">Cadastro de Vagas</h1><p className="text-sm text-blue-100">Vagas cadastradas pela sua empresa.</p></div></div>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-[#133c86]"><Plus size={17}/>Nova vaga</button>
    </header>
    <section className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white">
      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-3 border-b bg-gray-50 p-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar nas vagas" className="flex-1 rounded-lg border px-3 py-2"/>
        <button className="flex items-center gap-2 rounded-lg bg-[#133c86] px-4 py-2 font-bold text-white"><Search size={16}/>Pesquisar</button>
      </form>
      {loading ? <p className="p-12 text-center">Carregando...</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-[#34495E] text-white"><tr>{["Codigo","Area de atuacao","Quantidade","Sexo","Data","Situacao","Atividades"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody>{vagas.map((v)=><tr key={v.ReqId} className="border-t"><td className="px-4 py-3 font-bold text-[#133c86]">#{v.ReqId}</td><td className="px-4 py-3">{areaName(v.ReqAreaAtuacao)}</td><td className="px-4 py-3">{v.ReqQuantidade}</td><td className="px-4 py-3">{v.ReqSexo || "-"}</td><td className="px-4 py-3">{v.ReqDataSolita__o || "-"}</td><td className="px-4 py-3">{v.ReqSituacao || "Pendente"}</td><td className="max-w-md px-4 py-3">{v.ReqAtividades || "-"}</td></tr>)}</tbody>
      </table>{!vagas.length && <p className="p-12 text-center text-gray-500">Nenhuma vaga encontrada.</p>}</div>}
    </section>
    {open && <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="mb-5 flex justify-between"><h2 className="text-xl font-bold text-[#133c86]">Nova vaga</h2><button type="button" onClick={()=>setOpen(false)}><X/></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Area de atuacao"><select value={form.ReqAreaAtuacao} onChange={(e)=>setForm({...form,ReqAreaAtuacao:e.target.value})} className="rounded-lg border p-2"><option value="">Selecione</option>{areas.map(a=><option key={a.AreaCodigo} value={a.AreaCodigo}>{a.AreaDescricao}</option>)}</select></Field>
        <Field label="Quantidade"><input type="number" min="1" value={form.ReqQuantidade} onChange={(e)=>setForm({...form,ReqQuantidade:e.target.value})} className="rounded-lg border p-2"/></Field>
        <Field label="Sexo"><select value={form.ReqSexo} onChange={(e)=>setForm({...form,ReqSexo:e.target.value})} className="rounded-lg border p-2"><option value="A">Ambos</option><option value="F">Feminino</option><option value="M">Masculino</option></select></Field>
        <Field label="Data da solicitacao"><input type="date" value={form.ReqDataSolita__o} onChange={(e)=>setForm({...form,ReqDataSolita__o:e.target.value})} className="rounded-lg border p-2"/></Field>
        <Field label="Horario de trabalho"><input value={form.ReqHorarioTrabalho} onChange={(e)=>setForm({...form,ReqHorarioTrabalho:e.target.value})} className="rounded-lg border p-2"/></Field>
        <Field label="Habilidades"><input value={form.ReqHabilidades} onChange={(e)=>setForm({...form,ReqHabilidades:e.target.value})} className="rounded-lg border p-2"/></Field>
        <label className="flex flex-col gap-1 md:col-span-2 font-semibold">Atividades<textarea rows={4} value={form.ReqAtividades} onChange={(e)=>setForm({...form,ReqAtividades:e.target.value})} className="rounded-lg border p-2 font-normal"/></label>
      </div>
      <button disabled={saving} className="mt-5 flex items-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving&&<Loader2 className="animate-spin" size={17}/>}Salvar vaga</button>
    </form></div>}
  </div></ParceiroPageShell>;
}
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="flex flex-col gap-1 font-semibold">{label}{children}</label>; }
