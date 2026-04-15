/**
 * SCHEMAS DE API — SERVER ONLY
 *
 * Este arquivo contém os schemas Zod que tipam todas as rotas da API.
 * A importação `server-only` garante que este módulo NUNCA seja incluído
 * no bundle do browser. Qualquer tentativa de importá-lo em um Client
 * Component ("use client") causará um erro em build time.
 *
 * ✅ Pode importar: Server Components, Server Actions, Route Handlers
 * ❌ Não pode importar: Client Components ("use client")
 */
import "server-only";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitivos reutilizáveis
// ---------------------------------------------------------------------------

/** Campo de paginação padrão retornado pela API */
export const metaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

/** Envolve qualquer schema em uma resposta paginada */
export function paginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: metaSchema,
  });
}

export type Meta = z.infer<typeof metaSchema>;

// ---------------------------------------------------------------------------
// Auth / Usuário
// ---------------------------------------------------------------------------

export const loginBodySchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const usuarioSchema = z.object({
  UsuCodigo: z.string(),
  UsuNome: z.string().nullable(),
  UsuEmail: z.string().nullable(),
  UsuTipo: z.string().nullable(),
  cpf: z.string().nullable(),
  chk_ativo: z.boolean(),
  id_usuario: z.number().int().optional(),
  criado_em: z.string().optional(),
  atualizado_em: z.string().optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type Usuario = z.infer<typeof usuarioSchema>;

// ---------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------

export const unidadeSchema = z.object({
  UniCodigo: z.number().int(),
  UniNome: z.string().nullable(),
  UniEndereco: z.string().nullable(),
  UniNumeroEndereco: z.string().nullable(),
  UniComplemento: z.string().nullable(),
  UniBairro: z.string().nullable(),
  UniCEP: z.string().nullable(),
  UniCidade: z.string().nullable(),
  UniEstado: z.string().nullable(),
  UniTelefone: z.string().nullable(),
  UniCGC: z.string().nullable(),
  UniEnderecoWeb: z.string().nullable(),
  UniEmailPadraoEnvio: z.string().nullable(),
  UniRepresentanteLegal: z.string().nullable(),
  UniRepresentanteCargo: z.string().nullable(),
  UniTipo: z.string().nullable(),
  UniDataRefPesquisa: z.string().nullable().optional(),
});

export const unidadesResponseSchema = paginatedResponse(unidadeSchema);

export type Unidade = z.infer<typeof unidadeSchema>;
export type UnidadesResponse = z.infer<typeof unidadesResponseSchema>;

// ---------------------------------------------------------------------------
// Instituições de ensino
// ---------------------------------------------------------------------------

export const instituicaoEnsinoSchema = z.object({
  id_instituicao: z.number().int(),
  nome_instituicao: z.string(),
  email: z.string(),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  complemento: z.string().optional(),
  responsavel: z.string().optional(),
  telefone_responsavel: z.string().optional(),
  email_responsavel: z.string().optional(),
  chk_ativo: z.boolean(),
  created_at: z.string().optional(),
});

export const instituicoesEnsinoResponseSchema = paginatedResponse(instituicaoEnsinoSchema);

export type InstituicaoEnsino = z.infer<typeof instituicaoEnsinoSchema>;
export type InstituicoesEnsinoResponse = z.infer<typeof instituicoesEnsinoResponseSchema>;

// ---------------------------------------------------------------------------
// Ocorrência Tipo
// ---------------------------------------------------------------------------

export const ocorrenciaTipoSchema = z.object({
  OcoCodigo: z.number().int(),
  OcoDescricao: z.string().nullable(),
  OcoTipo: z.string().nullable(),
});

export const ocorrenciaTiposResponseSchema = paginatedResponse(ocorrenciaTipoSchema);

export type OcorrenciaTipo = z.infer<typeof ocorrenciaTipoSchema>;
export type OcorrenciaTiposResponse = z.infer<typeof ocorrenciaTiposResponseSchema>;
