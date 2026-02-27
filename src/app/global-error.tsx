"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Mesmo tratamento para falha de chunk em nível global
  if (
    error.message.includes("Loading chunk") ||
    error.message.includes("ChunkLoadError")
  ) {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <html lang="pt-br">
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Erro Crítico</h2>
          <p className="mt-2 text-gray-600">
            Não foi possível carregar a aplicação. Por favor, tente recarregar.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Recarregar Site
          </button>
        </div>
      </body>
    </html>
  );
}
