/**
 * SCHEMAS DE FORMULÁRIO — CLIENT SAFE
 *
 * Este arquivo contém schemas Zod usados em Client Components junto ao
 * React Hook Form (zodResolver). Por definição, validação de formulário
 * roda no browser para dar feedback imediato ao usuário — portanto estes
 * schemas NÃO podem ser server-only.
 *
 * Regra: coloque aqui APENAS validação de UX (mensagens de erro inline).
 * A validação definitiva de negócio deve sempre ocorrer no servidor (API).
 *
 * ✅ Pode importar: qualquer componente (Client ou Server)
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Ocorrência Tipo
// ---------------------------------------------------------------------------

export const ocorrenciaTipoFormSchema = z.object({
  OcoDescricao: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(50, "Descrição deve ter no máximo 50 caracteres"),
  OcoTipo: z
    .string()
    .min(1, "Tipo é obrigatório")
    .max(1, "Tipo deve ter no máximo 1 caractere"),
});

export type OcorrenciaTipoFormData = z.infer<typeof ocorrenciaTipoFormSchema>;
