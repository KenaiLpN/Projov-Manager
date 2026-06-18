"use client";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import api from "@/services/api";
import { ParceiroPageShell } from "./ParceiroPageShell";

type Row={codigo:number;unidade:string;aprendizCodigo:number|null;aprendiz:string;pesquisa:string;mes:string;ano:string;situacao:string;turma:string;dataRealizada:string|null};
export function AvaliacoesParceiroPage({status,title,description}:{status:"pendentes"|"realizadas";title:string;description:string}) {
 const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState("");
 useEffect(()=>{api.get("/empresa/avaliacoes",{params:{status}}).then(r=>setRows(r.data??[])).finally(()=>setLoading(false));},[status]);
 const visible=useMemo(()=>{const q=search.toLocaleLowerCase("pt-BR");return rows.filter(r=>Object.values(r).some(v=>String(v??"").toLocaleLowerCase("pt-BR").includes(q)));},[rows,search]);
 return <ParceiroPageShell><div className="min-h-full bg-gray-100 p-6"><header className="mx-auto mb-5 flex max-w-7xl items-center gap-3 rounded-xl bg-[#133c86] px-6 py-5 text-white"><ClipboardCheck/><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-blue-100">{description}</p></div></header><section className="mx-auto max-w-7xl overflow-hidden rounded-xl border bg-white"><label className="relative block border-b bg-gray-50 p-4"><Search className="absolute left-7 top-6 text-gray-400" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar" className="w-full rounded-lg border py-2 pl-9 pr-3"/></label>{loading?<p className="p-12 text-center">Carregando...</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#34495E] text-white"><tr>{["Unidade","Aprendiz","Pesquisa","Mes/Ano","Turma","Situacao","Realizada em"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{visible.map(r=><tr key={r.codigo} className="border-t"><td className="px-4 py-3">{r.unidade}</td><td className="px-4 py-3 font-semibold">{r.aprendiz} {r.aprendizCodigo?`(#${r.aprendizCodigo})`:""}</td><td className="px-4 py-3">{r.pesquisa}</td><td className="px-4 py-3">{r.mes}/{r.ano}</td><td className="px-4 py-3">{r.turma||"-"}</td><td className="px-4 py-3">{r.situacao}</td><td className="px-4 py-3">{r.dataRealizada||"-"}</td></tr>)}</tbody></table>{!visible.length&&<p className="p-12 text-center text-gray-500">Nenhuma avaliacao encontrada.</p>}</div>}</section></div></ParceiroPageShell>;
}
