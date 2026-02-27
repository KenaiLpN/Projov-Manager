"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Verifica se o erro é uma falha de carregamento de chunk (comum em novos deploys)
    const isChunkError =
      error.message.includes("Loading chunk") ||
      error.message.includes("ChunkLoadError");

    if (isChunkError) {
      // Tenta recarregar a página automaticamente para pegar o build novo
      window.location.reload();
    }

    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800">
        Ops! Algo deu errado.
      </h2>
      <p className="mt-2 text-gray-600">
        Houve um erro ao carregar esta parte do sistema. Isso geralmente
        acontece após uma atualização.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Recarregar Página
      </button>
    </div>
  );
}
