import { createApp } from "./app";

async function start() {
  try {
    const app = createApp();
    const port = Number(process.env.API_PORT || process.env.PORT) || 3333;

    await app.listen({ port, host: process.env.API_HOST?.trim() || "127.0.0.1" });
    console.log(`HTTP Server running on port ${port}`);
  } catch (error) {
    console.error("Falha ao iniciar o servidor HTTP da API:", error);
    process.exit(1);
  }
}

void start();
