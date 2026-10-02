import { z } from "zod";

export const recordIdSchema = z.coerce.number().int().positive().max(2147483647);
export const dateOnlySchema = z.string().max(10).regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  "Data inválida.",
);
const optionalDate = z.union([dateOnlySchema, z.literal("")]).nullable().optional();
const optionalTime = z.string().max(5).regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^$/).nullable().optional();
const optionalNumber = z.union([z.number().finite(), z.string().max(30).refine(
  (value) => value === "" || Number.isFinite(Number(value)),
)]).nullable().optional();
const optionalId = z.union([recordIdSchema, z.literal("")]).nullable().optional();

export const paginatedQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(1000000).default(1),
  limit: z.coerce.number().int().positive().max(1000).default(10),
  search: z.string().max(500).optional(),
});

// Unknown fields (including identity and audit fields) never reach the services.
export const createAlocacaoBodySchema = z.object({
  ALATurma: recordIdSchema,
  ALAUnidadeParceiro: recordIdSchema,
  ALAStatus: z.string().max(1).nullable().optional(),
  ALATutor: z.string().max(8).nullable().optional(),
  ALADataInicio: optionalDate,
  ALADataPrevTermino: optionalDate,
  ALADataTermino: optionalDate,
  ALAInicioExpediente: optionalTime,
  ALATerminoExpediente: optionalTime,
  ALAValorBolsa: optionalNumber,
  ALAValorTaxa: optionalNumber,
  ALAValorEncargos: optionalNumber,
  ALAObservacao: z.string().max(255).nullable().optional(),
  ALApagto: z.string().max(1).nullable().optional(),
  ALAOrientador: optionalId,
  ALAMotivoDesligamento: optionalId,
  ALAAreaAtuacao: optionalId,
  ALATurmaAnterior: optionalId,
});
export const updateAlocacaoBodySchema = createAlocacaoBodySchema.omit({ ALATurmaAnterior: true }).partial();

export const createCapacitacaoBodySchema = z.object({
  CapTurma: recordIdSchema,
  CapUnidade: recordIdSchema,
  CapStatus: z.string().max(1).optional(),
  CapDataInicio: dateOnlySchema,
  CapDataPrevTermino: optionalDate,
  CapDataTermino: optionalDate,
  CapObservacoes: z.string().max(1000).nullable().optional(),
});
export const updateCapacitacaoBodySchema = createCapacitacaoBodySchema.partial();

export const capacitacaoPresencasBodySchema = z.object({
  registros: z.array(z.object({
    aprendiz: recordIdSchema,
    turma: recordIdSchema,
    data: dateOnlySchema,
    presenca: z.string().max(1).nullable(),
  })).min(1).max(1000),
});

export const createPlanoBodySchema = z.object({
  PlanCurso: z.string().min(1).max(6),
  PlanDescricao: z.string().max(80).nullable().optional(),
});
export const updatePlanoBodySchema = createPlanoBodySchema.partial();

export const updatePlanoCurricularBodySchema = z.object({
  PlcCargaHoraria: z.number().int().min(0).max(32767).nullable().optional(),
  PlcTipoAvaliacao: z.string().max(1).nullable().optional(),
  PlcNumeroAulas: z.number().int().min(0).max(127).nullable().optional(),
  PlcDescricao: z.string().max(50).nullable().optional(),
  PlcOrdemDisciplina: z.number().int().min(0).max(2147483647).nullable().optional(),
  PlcGeraCronograma: z.string().max(1).nullable().optional(),
  EducCodigo: recordIdSchema.nullable().optional(),
});
export const createPlanoCurricularBodySchema = updatePlanoCurricularBodySchema.extend({
  PlcCodigoPlano: recordIdSchema,
  PlcDisciplina: recordIdSchema,
});
export const planoCurricularParamsSchema = z.object({
  codigoPlano: recordIdSchema,
  disciplina: recordIdSchema,
});
