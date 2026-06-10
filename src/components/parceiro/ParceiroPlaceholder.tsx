import { Construction } from "lucide-react";
import { ParceiroPageShell } from "./ParceiroPageShell";

export function ParceiroPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <ParceiroPageShell>
      <div className="flex min-h-full items-center justify-center p-8">
        <section className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Construction className="mx-auto text-[#133c86]" size={44} />
          <h1 className="mt-4 text-2xl font-bold text-[#133c86]">{title}</h1>
          <p className="mt-2 text-gray-500">{description}</p>
          <div className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-[#133c86]">
            Rota criada e liberada para empresas parceiras. A funcionalidade será implementada nas próximas etapas.
          </div>
        </section>
      </div>
    </ParceiroPageShell>
  );
}
