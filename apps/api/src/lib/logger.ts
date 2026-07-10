import fs from "fs";
import path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR";
type LogCategory = "auth" | "requests" | "errors" | "audit";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERNS = [
  /senha/i,
  /password/i,
  /token/i,
  /secret/i,
  /cookie/i,
  /authorization/i,
  /cpf/i,
  /cnpj/i,
  /email/i,
  /telefone/i,
  /celular/i,
  /endereco/i,
  /cep/i,
];

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function redactSensitiveData(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      output[key] = isSensitiveKey(key) ? REDACTED : redactSensitiveData(nestedValue);
    }

    return output;
  }

  return value;
}

/** Garante que o diretório de logs existe antes de escrever */
function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/** Escreve uma entrada JSON no arquivo de log correspondente */
function write(
  category: LogCategory,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) {
  try {
    ensureDir();
    const safeMeta = meta
      ? (redactSensitiveData(meta) as Record<string, unknown>)
      : {};
    const entry =
      JSON.stringify({ ts: new Date().toISOString(), level, message, ...safeMeta }) + "\n";
    fs.appendFileSync(path.join(LOG_DIR, `${category}.log`), entry);
  } catch {
    // Falhas de log nunca devem derrubar a aplicação
  }
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export const logger = {
  /** Eventos de autenticação */
  auth: {
    loginSuccess(userId: string, role: string, ip?: string) {
      write("auth", "INFO", "Login realizado com sucesso", { userId, role, ip });
    },
    loginFailed(userId: string, reason: string, ip?: string) {
      write("auth", "WARN", "Tentativa de login malsucedida", { userId, reason, ip });
    },
    logout(userId: string, ip?: string) {
      write("auth", "INFO", "Logout realizado", { userId, ip });
    },
    firstAccess(userId: string, ip?: string) {
      write("auth", "INFO", "Primeiro acesso — senha criada", { userId, ip });
    },
    passwordResetRequested(email: string, ip?: string) {
      write("auth", "INFO", "Redefinição de senha solicitada", { email, ip });
    },
    passwordResetCompleted(email: string, ip?: string) {
      write("auth", "INFO", "Redefinição de senha concluída", { email, ip });
    },
    tokenInvalid(ip?: string, url?: string) {
      write("auth", "WARN", "Token inválido ou ausente", { ip, url });
    },
  },

  /** Log de toda requisição HTTP recebida */
  request(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    userId?: string | null,
    ip?: string
  ) {
    write("requests", "INFO", `${method} ${url}`, {
      statusCode,
      durationMs,
      userId: userId ?? null,
      ip,
    });
  },

  /** Erros internos da aplicação */
  error(message: string, meta?: Record<string, unknown>) {
    write("errors", "ERROR", message, meta);
  },

  /** Operações de escrita (CREATE / UPDATE / DELETE) para auditoria */
  audit(
    action: "CREATE" | "UPDATE" | "DELETE",
    resource: string,
    resourceId?: string | number | null,
    userId?: string | null,
    ip?: string
  ) {
    write("audit", "INFO", `${action} ${resource}`, { resourceId, userId, ip });
  },
};
