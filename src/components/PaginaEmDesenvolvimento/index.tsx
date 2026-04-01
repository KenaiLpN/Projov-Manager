import { PedagogicoSidebar } from "@/components/pedagogicosidebar";

interface PaginaEmDesenvolvimentoProps {
  titulo: string;
}

/**
 * Componente reutilizável para páginas ainda não implementadas.
 * Substitui as ~27 cópias do mesmo template no módulo pedagógico.
 */
export default function PaginaEmDesenvolvimento({ titulo }: PaginaEmDesenvolvimentoProps) {
  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col p-8 bg-gray-50 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#133c86] uppercase mb-4 tracking-tight">
          {titulo}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17L4.655 7.81a2.75 2.75 0 010-3.891l.5-.5a2.75 2.75 0 013.891 0l2.39 2.39m0 0l3.032-2.496c.14-.468.382-.891.766-1.208"
              />
            </svg>
            <p className="text-gray-500 italic font-medium tracking-tight">
              Página em desenvolvimento.
            </p>
            <p className="text-gray-400 text-sm">
              Em breve as funcionalidades de <strong>{titulo}</strong> estarão disponíveis aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
