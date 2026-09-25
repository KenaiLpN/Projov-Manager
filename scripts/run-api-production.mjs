// O canal IPC fecha mesmo se a hospedagem encerrar o pai abruptamente.
// Encerrar aqui evita uma API orfa ocupando a porta no proximo inicio.
process.on("disconnect", () => process.exit(0));
await import("../apps/api/dist/server.js");
