"use client";

import { useState } from "react";
import { CalendarRange, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";

type Row = {
  aprendizCodigo: number;
  aprendiz: string;
  unidade: string;
  faltas: number;
};

export default function ContagemFaltasPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) return toast.error("Informe o periodo.");
    if (startDate > endDate) return toast.error("A data inicial deve ser anterior a data final.");
    setLoading(true);
    try {
      const response = await api.get("/empresa/contagem-faltas", { params: { startDate, endDate } });
      setRows(response.data ?? []);
    } catch {
      toast.error("Nao foi possivel consultar as faltas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ParceiroPageShell>
      <div className="min-h-full bg-gray-100 p-6">
        <header className="mx-auto mb-5 flex max-w-6xl items-center gap-3 rounded-xl bg-[#133c86] px-6 py-5 text-white">
          <CalendarRange />
          <div>
            <h1 className="text-2xl font-bold">Contagem de Faltas</h1>
            <p className="text-sm text-blue-100">Faltas dos aprendizes vinculados a empresa.</p>
          </div>
        </header>
        <section className="mx-auto max-w-6xl overflow-hidden rounded-xl border bg-white">
          <form onSubmit={submit} className="flex flex-wrap items-end gap-4 border-b bg-gray-50 p-5">
            <DateField label="Data inicial" value={startDate} onChange={setStartDate} />
            <DateField label="Data final" value={endDate} onChange={setEndDate} />
            <button disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 font-bold text-white">
              <Search size={17} />{loading ? "Consultando..." : "Pesquisar"}
            </button>
          </form>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#34495E] text-white">
              <tr><th className="px-4 py-3">Matricula</th><th className="px-4 py-3">Aprendiz</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Faltas</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.aprendizCodigo}-${row.unidade}`} className="border-t">
                  <td className="px-4 py-3 font-bold text-[#133c86]">{row.aprendizCodigo}</td>
                  <td className="px-4 py-3">{row.aprendiz}</td>
                  <td className="px-4 py-3">{row.unidade}</td>
                  <td className="px-4 py-3 font-bold text-red-700">{row.faltas}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && !loading && <p className="p-12 text-center text-gray-500">Selecione um periodo para consultar.</p>}
        </section>
      </div>
    </ParceiroPageShell>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex flex-col gap-1 font-semibold">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border px-3 py-2" /></label>;
}
