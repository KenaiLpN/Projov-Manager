import { createHash } from "node:crypto";

/** Trust only infrastructure explicitly configured by the operator, never every hop. */
export function trustedProxyConfiguration(value = process.env.TRUSTED_PROXY_CIDRS): false | string[] {
  const entries = value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
  if (entries.some((entry) => ["true", "*", "0.0.0.0/0", "::/0"].includes(entry))) {
    throw new Error("TRUSTED_PROXY_CIDRS deve conter apenas enderecos/redes dos proxies confiaveis.");
  }
  return entries.length ? entries : false;
}

/** Called only after parsing valid JSON; strings are decoded before comparing keys. */
export function hasDuplicateJsonKeys(json: string): boolean {
  const containers: (Set<string> | null)[] = [];
  for (let index = 0; index < json.length; index++) {
    const char = json[index];
    if (char === "{") containers.push(new Set());
    else if (char === "[") containers.push(null);
    else if (char === "}" || char === "]") containers.pop();
    else if (char === '"') {
      const start = index;
      while (++index < json.length) {
        if (json[index] === "\\") index++;
        else if (json[index] === '"') break;
      }
      let next = index + 1;
      while (/\s/.test(json[next] ?? "") && next < json.length) next++;
      const keys = containers[containers.length - 1];
      if (keys && json[next] === ":") {
        const key = JSON.parse(json.slice(start, index + 1)) as string;
        if (keys.has(key)) return true;
        keys.add(key);
      }
    }
  }
  return false;
}

export function hasDuplicateQueryKeys(url: string): boolean {
  const queryStart = url.indexOf("?");
  if (queryStart < 0) return false;
  const keys = new Set<string>();
  for (const key of new URLSearchParams(url.slice(queryStart + 1)).keys()) {
    if (keys.has(key)) return true;
    keys.add(key);
  }
  return false;
}

/** Complement IP limits with an account bucket, without storing personal identifiers. */
export class AccountAttemptLimiter {
  private readonly entries = new Map<string, { count: number; expiresAt: number }>();

  clear(scope: string, identifier: string) {
    const key = createHash("sha256").update(`${scope}:${identifier.trim().toLowerCase()}`).digest("hex");
    this.entries.delete(key);
  }

  consume(scope: string, identifier: string, max: number, windowMs: number, now = Date.now()) {
    const key = createHash("sha256").update(`${scope}:${identifier.trim().toLowerCase()}`).digest("hex");
    let bucket = this.entries.get(key);
    if (!bucket || bucket.expiresAt <= now) {
      if (this.entries.size >= 10_000) {
        for (const [existingKey, value] of this.entries) {
          if (value.expiresAt <= now) this.entries.delete(existingKey);
        }
        // Fail closed at capacity instead of evicting active account protections.
        if (this.entries.size >= 10_000) return Math.ceil(windowMs / 1000);
      }
      bucket = { count: 0, expiresAt: now + windowMs };
      this.entries.set(key, bucket);
    }
    bucket.count++;
    return bucket.count > max ? Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)) : 0;
  }
}
