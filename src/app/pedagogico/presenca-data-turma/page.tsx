"use client";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";

export default function Page() {
  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col p-8 bg-gray-50 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#133c86] uppercase mb-4 tracking-tight">PRESENCA DATA TURMA</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <p className="text-gray-500 italic font-medium tracking-tight">Página em desenvolvimento: em breve as funcionalidades para PRESENCA DATA TURMA estarão disponíveis aqui.</p>
        </div>
      </div>
    </div>
  );
}
