// Edge-compatible verification. Import only in server/middleware code.
export type VerifiedSession = {
  sub: string;
  nome: string;
  role: string;
  tokenTipo: string;
  tipoAcesso: string;
  exp: number;
};

const roles = new Set(["A", "C", "P", "T", "E", "S", "DEV", "APRENDIZ", "EDUCADOR", "EMPRESA"]);
const externalRoles = new Set(["APRENDIZ", "EDUCADOR", "EMPRESA"]);

function decodePart(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid token encoding");
  const decoded = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): Promise<VerifiedSession | null> {
  if (!token || !secret || token.length > 8192) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerPart, payloadPart, signaturePart] = parts;
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const header = JSON.parse(decoder.decode(decodePart(headerPart)));
    if (!header || header.alg !== "HS256" || header.crit || header.b64 === false) return null;
    const signature = decodePart(signaturePart);
    if (signature.length !== 32) return null;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"],
    );
    if (!await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(`${headerPart}.${payloadPart}`))) return null;
    const claims = JSON.parse(decoder.decode(decodePart(payloadPart)));
    if (!claims || typeof claims.sub !== "string" || !claims.sub.trim() ||
        typeof claims.nome !== "string" || typeof claims.role !== "string" || !roles.has(claims.role) ||
        typeof claims.tokenTipo !== "string" || !claims.tokenTipo ||
        !Number.isSafeInteger(claims.exp) || claims.exp * 1000 <= now ||
        (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf * 1000 > now))) return null;
    if (claims.tipoAcesso !== (externalRoles.has(claims.role) ? claims.role : "USUARIO")) return null;
    return claims as VerifiedSession;
  } catch {
    return null;
  }
}
