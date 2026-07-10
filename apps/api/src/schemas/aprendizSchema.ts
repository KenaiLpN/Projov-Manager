import { z } from "zod";
const dateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === "string" && val.trim() !== "") return new Date(val);
    return null;
  });
const emptyToNull = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val && val.trim() !== "" ? val.trim() : null));
const emptyToNumberNull = z
  .union([z.number(), z.string().trim().length(0)])
  .optional()
  .nullable()
  .transform((val) => (typeof val === "number" ? val : null));
export const aprendizSchema = z
  .object({
    IdAluno: z.number().int().optional().nullable(),
    CodigoExterno: emptyToNull.pipe(z.string().max(50).nullable()),
    NomeJovem: z.string().max(150),
    NomeSocial: emptyToNull.pipe(z.string().max(150).nullable()),
    IdUnidade: emptyToNumberNull.pipe(z.number().int().nullable()),
    IdInstituicaoParceira: emptyToNumberNull.pipe(z.number().int().nullable()),
    IdEscola: emptyToNumberNull.pipe(z.number().int().nullable()),
    IdMonitorResponsavel: emptyToNumberNull.pipe(z.number().int().nullable()),
    IdTurmaCapacitacao: emptyToNumberNull.pipe(z.number().int().nullable()),
    DataNascimento: dateSchema,
    Sexo: emptyToNull.pipe(z.string().max(20).nullable()),
    EstadoCivil: emptyToNull.pipe(z.string().max(20).nullable()),
    Nacionalidade: emptyToNull.pipe(z.string().max(50).nullable()),
    UF_Naturalidade: emptyToNull.pipe(z.string().max(2).nullable()),
    Naturalidade: emptyToNull.pipe(z.string().max(100).nullable()),
    AlistamentoMilitar: emptyToNull.pipe(z.string().max(3).nullable()),
    EstudaAtualmente: emptyToNull.pipe(z.string().max(3).nullable()),
    EscolaridadeNivel: emptyToNull.pipe(z.string().max(100).nullable()),
    TipoAprendizagem: emptyToNull.pipe(z.string().max(50).nullable()),
    TurnoEscolar: emptyToNull.pipe(z.string().max(20).nullable()),
    StatusJovem: emptyToNull.pipe(z.string().max(50).nullable()),
    TipoPagamento: emptyToNull.pipe(z.string().max(30).nullable()),
    CBO: emptyToNull.pipe(z.string().max(20).nullable()),
    AreaAtuacao: emptyToNull.pipe(z.string().max(100).nullable()),
    HorasDiarias: emptyToNumberNull.pipe(z.number().int().nullable()),
    MesesContrato: emptyToNumberNull.pipe(z.number().int().nullable()),
    DataInicioEmpresa: dateSchema,
    DataInicioAprendizagem: dateSchema,
    DataPrevistaTermino: dateSchema,
    DataDesligamento: dateSchema,
    DataInicioFerias: dateSchema,
    DataTerminoFerias: dateSchema,
    TurmaSimultaneidade: emptyToNull.pipe(z.string().max(100).nullable()),
    TurmaCCI: emptyToNull.pipe(z.string().max(100).nullable()),
    RG: emptyToNull.pipe(z.string().max(20).nullable()),
    RG_DataEmissao: dateSchema,
    RG_OrgaoExpedidor: emptyToNull.pipe(z.string().max(20).nullable()),
    RG_UF: emptyToNull.pipe(z.string().max(2).nullable()),
    CPF: emptyToNull
      .transform((v) => (v ? v.replace(/\D/g, "") : null))
      .pipe(z.string().max(11).nullable()),
    PIS: emptyToNull.pipe(z.string().max(20).nullable()),
    CTPS_Numero: emptyToNull.pipe(z.string().max(20).nullable()),
    CTPS_Serie: emptyToNull.pipe(z.string().max(10).nullable()),
    Reservista: emptyToNull.pipe(z.string().max(20).nullable()),
    TituloEleitor: emptyToNull.pipe(z.string().max(20).nullable()),
    TituloSecao: emptyToNull.pipe(z.string().max(10).nullable()),
    TituloZona: emptyToNull.pipe(z.string().max(10).nullable()),
    CEP: emptyToNull
      .transform((v) => (v ? v.replace(/\D/g, "") : null))
      .pipe(z.string().max(8).nullable()),
    Logradouro: emptyToNull.pipe(z.string().max(150).nullable()),
    Numero: emptyToNull.pipe(z.string().max(20).nullable()),
    Complemento: emptyToNull.pipe(z.string().max(50).nullable()),
    Bairro: emptyToNull.pipe(z.string().max(100).nullable()),
    Municipio: emptyToNull.pipe(z.string().max(100).nullable()),
    UF_Endereco: emptyToNull.pipe(z.string().max(2).nullable()),
    TelefoneFixo: emptyToNull.pipe(z.string().max(20).nullable()),
    Celular: emptyToNull.pipe(z.string().max(20).nullable()),
    Email: emptyToNull.pipe(z.string().max(100).nullable()),
    OutrosTelefones: emptyToNull.pipe(z.string().max(255).nullable()),
    UltimaTentativa: emptyToNull.pipe(z.string().max(50).nullable()),
    DataUltimaInteracao: dateSchema,
    UsaMedicamentos: z.boolean().optional().nullable(),
    MedicamentosQual: emptyToNull.pipe(z.string().max(255).nullable()),
    MedicamentosFinalidade: emptyToNull.pipe(z.string().max(255).nullable()),
    TemAlergia: z.boolean().optional().nullable(),
    AlergiaQual: emptyToNull.pipe(z.string().max(255).nullable()),
    TemProblemaSaude: z.boolean().optional().nullable(),
    ProblemaSaudeQual: emptyToNull.pipe(z.string().max(255).nullable()),
    Deficiencia: emptyToNull.pipe(z.string().max(50).nullable()),
    Senha: emptyToNull.pipe(z.string().nullable()),
    Gestante: z.boolean().optional().nullable(),
    MesesGestacao: emptyToNumberNull.pipe(z.number().int().nullable()),
    PartoRealizado: z.boolean().optional().nullable(),
    DataParto: dateSchema,
  })
  .passthrough();
export type AprendizInput = z.infer<typeof aprendizSchema>;
export const listAprendizQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  filter: z.string().optional(),
  advancedFilter: z.string().optional(),
});
export type ListAprendizQuery = z.infer<typeof listAprendizQuerySchema>;
export const aprendizResponseSchema = aprendizSchema;
export const listAprendizResponseSchema = z.object({
  data: z.array(aprendizResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export const updateAprendizParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type UpdateAprendizParams = z.infer<typeof updateAprendizParamsSchema>;
export const deleteAprendizParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type DeleteAprendizParams = z.infer<typeof deleteAprendizParamsSchema>;