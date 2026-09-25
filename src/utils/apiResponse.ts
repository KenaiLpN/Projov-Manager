/** Respostas externas precisam ser verificadas antes de entrar no estado React. */
export class InvalidApiResponseError extends Error {
  constructor() {
    super("O servidor retornou dados em formato inesperado. Tente novamente.");
    this.name = "InvalidApiResponseError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Preserva a tipagem do consumidor; valida a estrutura, não os campos de cada item.
export function validateArray<T>(value: T): T {
  if (!Array.isArray(value)) throw new InvalidApiResponseError();
  return value;
}

export function validatePaginatedResponse<T>(value: T): T {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.meta)) {
    throw new InvalidApiResponseError();
  }
  for (const field of ["page", "limit", "total", "totalPages"]) {
    const number = value.meta[field];
    if (typeof number !== "number" || !Number.isSafeInteger(number) || number < 0) {
      throw new InvalidApiResponseError();
    }
  }
  if (Number(value.meta.page) < 1 || Number(value.meta.limit) < 1) throw new InvalidApiResponseError();
  return value;
}

export function validateJsonResponse(data: unknown, contentType: unknown, status: number) {
  if (status === 204 || status === 205) return;
  const mediaType = String(contentType ?? "").split(";")[0].trim().toLowerCase();
  if (!(mediaType === "application/json" || mediaType.endsWith("+json")) ||
      (!isRecord(data) && !Array.isArray(data))) {
    throw new InvalidApiResponseError();
  }
}
