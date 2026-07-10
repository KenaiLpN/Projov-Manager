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

const apprenticePassword = emptyToNull.refine(
  (value) => !value || value.length >= 6,
  { message: "A senha do aprendiz deve ter no minimo 6 caracteres." },
);

const emptyToFloatNull = z
  .union([z.number(), z.string().trim().length(0), z.null()])
  .optional()
  .nullable()
  .transform((val) => (typeof val === "number" ? val : null));

const updateEmptyToNullValue = z
  .union([z.string(), z.null()])
  .transform((val) => (val && val.trim() !== "" ? val.trim() : null));

const updateEmptyToNull = updateEmptyToNullValue.optional();

const updateApprenticePassword = updateEmptyToNullValue.refine(
  (value) => !value || value.length >= 6,
  { message: "A senha do aprendiz deve ter no minimo 6 caracteres." },
).optional();

const updateEmptyToFloatNull = z
  .union([z.number(), z.string().trim().length(0), z.null()])
  .transform((val) => (typeof val === "number" ? val : null))
  .optional();

const updateEmptyToNumberNull = z
  .union([z.bigint(), z.number(), z.null()])
  .transform((val) => (val !== null ? Number(val) : null))
  .optional();

export const caAprendizSchema = z
  .object({
    Apr_Codigo: z.union([z.bigint(), z.number()]).optional().nullable(),

    // Dados pessoais
    Apr_Nome:             emptyToNull,
    Apr_NomeSocial:       emptyToNull,
    Apr_DataDeNascimento: dateSchema,
    Apr_Sexo:             emptyToNull,
    AprEstadoCivil:       emptyToNull,
    Apr_Nacionalidade:    emptyToNull,
    Apr_Naturalidade:     emptyToNull,
    Apr_UF_Nat:           emptyToNull,
    Apr_NomeMae:          emptyToNull,
    Apr_NomePai:          emptyToNull,
    Apr_Exercito:         emptyToNull,
    Apr_Estudante:        emptyToNull,
    Apr_TurnoEscolar:     emptyToNull,
    Apr_Deficiencia:      emptyToNull,
    Apr_Piercing:         emptyToNull,
    Apr_Tatuagem:         emptyToNull,
    Apr_Observacoes:      emptyToNull,
    Apr_Mensagem:         emptyToNull,
    Apr_ValidadeMensagem: dateSchema,

    // Vínculo e contrato
    Apr_NumSistExterno:      emptyToNull,
    Apr_CBO:                 emptyToNull,
    Apr_TipoAprendizagem:    emptyToNull,
    Apr_TipoContrato:        emptyToNull,
    Apr_InstParceira:        emptyToFloatNull,
    Apr_Unidade:             z.union([z.bigint(), z.number()]).optional().nullable().transform(v => v !== null && v !== undefined ? Number(v) : null),
    Apr_DataInicioEmpresa:   dateSchema,
    Apr_InicioAprendizagem:  dateSchema,
    Apr_PrevFimAprendizagem: dateSchema,
    Apr_FimAprendizagem:     dateSchema,
    Apr_DataContrato:        dateSchema,
    Apr_DataInicioFerias:    dateSchema,
    Apr_DataTerminoFerias:   dateSchema,
    Apr_Turma:               emptyToFloatNull,
    Apr_TurmaCCI:            emptyToFloatNull,
    Apr_TurmaENC:            emptyToFloatNull,
    Apr_PlanoCurricular:     emptyToFloatNull,
    Apr_AreaAtuacao:         emptyToFloatNull,
    Apr_HorasDiarias:        emptyToFloatNull,
    Apr_MesesContrato:       emptyToFloatNull,
    AprMotivoDesligamento1:  emptyToFloatNull,
    Apr_Situacao:            z.union([z.bigint(), z.number()]).optional().nullable().transform(v => v !== null && v !== undefined ? Number(v) : null),

    // Escola
    AprCodEscola:       emptyToFloatNull,
    Apr_NomeEscola:     emptyToNull,
    Apr_Escola_HInicio: dateSchema,
    Apr_Escola_HTermino: dateSchema,
    Apr_Escolaridade:   emptyToFloatNull,

    // Documentação
    Apr_CarteiraDeIdentidade: emptyToNull,
    Apr_DataEmissao_Ident:    dateSchema,
    Apr_OrgaoEmissor_Ident:   emptyToNull,
    Apr_UF_Ident:             emptyToNull,
    Apr_CPF:                  emptyToNull.transform(v => (v ? v.replace(/\D/g, "") : null)),
    Apr_PIS:                  emptyToNull,
    Apr_CarteiraDeTrabalho:   emptyToNull,
    Apr_Serie_Cartrab:        emptyToNull,
    Apr_DataEmissao_CartTrab: dateSchema,
    Apr_UF_CartTrab:          emptyToNull,
    Apr_PNE:                  emptyToNull,
    Apr_NumeroTitulo:         emptyToNull,
    Apr_SecaoTitulo:          emptyToNull,
    Apr_ZonaTitulo:           emptyToNull,

    // Endereço e contato
    Apr_CEP:             emptyToNull.transform(v => (v ? v.replace(/\D/g, "") : null)),
    Apr_Endereco:        emptyToNull,
    Apr_NumeroEndereco:  emptyToNull,
    Apr_Complemento:     emptyToNull,
    Apr_Bairro:          emptyToNull,
    Apr_Cidade:          emptyToNull,
    Apr_UF:              emptyToNull,
    Apr_Telefone:        emptyToNull,
    Apr_Celular:         emptyToNull,
    Apr_Email:           emptyToNull,
    Apr_OutrosTelefones: emptyToNull,
    Apr_TentativaContato:   emptyToNull,
    Apr_TentaticaContato01: emptyToNull,
    Apr_TentaticaContato02: emptyToNull,
    Apr_TentaticaContato03: emptyToNull,

    // Familiar / responsável
    Apr_Responsavel:        emptyToNull,
    Apr_Resp_CPF:           emptyToNull,
    Apr_Resp_EstadoCivil:   emptyToNull,
    Apr_Resp_GrauInstrucao: emptyToNull,
    Apr_Resp_Profissao:     emptyToNull,
    Apr_Telefone_Resp:      emptyToNull,
    Apr_Celular_Resp:       emptyToNull,
    Apr_Telefone_Contato:   emptyToNull,
    Apr_Tipo_Contato:       emptyToNull,
    Apr_Resp_Parentesco:    emptyToFloatNull,
    Apr_Resp_Observacoes:   emptyToNull,

    // Sócio-econômico
    Apr_SituacaoResidencia: emptyToNull,
    Apr_aluguel:            emptyToFloatNull,
    Apr_NumeroFamiliares:   z.union([z.bigint(), z.number()]).optional().nullable().transform(v => v !== null && v !== undefined ? Number(v) : null),
    Apr_beneficio:          emptyToNull,
    Apr_recebebeneficio:    emptyToNull,
    Apr_BolsaFamilia:       emptyToFloatNull,
    Apr_pensao:             emptyToFloatNull,
    Apr_outros:             emptyToFloatNull,
    Apr_CarteiraAssinada:   emptyToNull,
    Apr_Empresa:            emptyToNull,
    Apr_Cargo:              emptyToNull,
    Apr_TempoPermanencia:   emptyToNull,

    // Saúde
    Apr_UsaMedicamento: emptyToNull,
    Apr_NomeMedicamento: emptyToNull,
    Apr_TipoMedicamento: emptyToNull,
    Apr_Alergia:         emptyToNull,
    Apr_TipoAlergia:     emptyToNull,
    Apr_Doenca:          emptyToNull,
    Apr_NomeDoenca:      emptyToNull,

    // Acesso
    Apr_senha: apprenticePassword,

    // Monitor / usuário
    Apr_UsuarioCadastro:      emptyToNull,
    Apr_DataCadastro:         dateSchema,
    Apr_UsuarioDataCadastro:  dateSchema,
    Apr_DataTransferTurma:    dateSchema,
  })
  .passthrough();

export type CaAprendizInput = z.infer<typeof caAprendizSchema>;

export const updateOwnAprendizSchema = z
  .object({
    // Dados pessoais que o proprio aprendiz pode manter atualizados.
    Apr_NomeSocial: updateEmptyToNull,
    AprEstadoCivil: updateEmptyToNull,
    Apr_Nacionalidade: updateEmptyToNull,
    Apr_Naturalidade: updateEmptyToNull,
    Apr_UF_Nat: updateEmptyToNull,
    Apr_NomeMae: updateEmptyToNull,
    Apr_NomePai: updateEmptyToNull,
    Apr_Exercito: updateEmptyToNull,
    Apr_Estudante: updateEmptyToNull,
    Apr_TurnoEscolar: updateEmptyToNull,
    Apr_Deficiencia: updateEmptyToNull,
    Apr_Piercing: updateEmptyToNull,
    Apr_Tatuagem: updateEmptyToNull,

    // Contato e endereco.
    Apr_CEP: updateEmptyToNull.transform(v => (v ? v.replace(/\D/g, "") : v)),
    Apr_Endereco: updateEmptyToNull,
    Apr_NumeroEndereco: updateEmptyToNull,
    Apr_Complemento: updateEmptyToNull,
    Apr_Bairro: updateEmptyToNull,
    Apr_Cidade: updateEmptyToNull,
    Apr_UF: updateEmptyToNull,
    Apr_Telefone: updateEmptyToNull,
    Apr_Celular: updateEmptyToNull,
    Apr_Email: updateEmptyToNull,
    Apr_OutrosTelefones: updateEmptyToNull,
    Apr_TentativaContato: updateEmptyToNull,
    Apr_TentaticaContato01: updateEmptyToNull,
    Apr_TentaticaContato02: updateEmptyToNull,
    Apr_TentaticaContato03: updateEmptyToNull,

    // Familiar / responsavel.
    Apr_Responsavel: updateEmptyToNull,
    Apr_Resp_CPF: updateEmptyToNull,
    Apr_Resp_EstadoCivil: updateEmptyToNull,
    Apr_Resp_GrauInstrucao: updateEmptyToNull,
    Apr_Resp_Profissao: updateEmptyToNull,
    Apr_Telefone_Resp: updateEmptyToNull,
    Apr_Celular_Resp: updateEmptyToNull,
    Apr_Telefone_Contato: updateEmptyToNull,
    Apr_Tipo_Contato: updateEmptyToNull,
    Apr_Resp_Parentesco: updateEmptyToFloatNull,
    Apr_Resp_Observacoes: updateEmptyToNull,

    // Socioeconomico.
    Apr_SituacaoResidencia: updateEmptyToNull,
    Apr_aluguel: updateEmptyToFloatNull,
    Apr_NumeroFamiliares: updateEmptyToNumberNull,
    Apr_beneficio: updateEmptyToNull,
    Apr_recebebeneficio: updateEmptyToNull,
    Apr_BolsaFamilia: updateEmptyToFloatNull,
    Apr_pensao: updateEmptyToFloatNull,
    Apr_outros: updateEmptyToFloatNull,
    Apr_CarteiraAssinada: updateEmptyToNull,
    Apr_Empresa: updateEmptyToNull,
    Apr_Cargo: updateEmptyToNull,
    Apr_TempoPermanencia: updateEmptyToNull,

    // Saude.
    Apr_UsaMedicamento: updateEmptyToNull,
    Apr_NomeMedicamento: updateEmptyToNull,
    Apr_TipoMedicamento: updateEmptyToNull,
    Apr_Alergia: updateEmptyToNull,
    Apr_TipoAlergia: updateEmptyToNull,
    Apr_Doenca: updateEmptyToNull,
    Apr_NomeDoenca: updateEmptyToNull,

    // Acesso.
    Apr_senha: updateApprenticePassword,
  })
  .partial()
  .strip();

export type UpdateOwnAprendizInput = z.infer<typeof updateOwnAprendizSchema>;

export const listCaAprendizQuerySchema = z.object({
  page:            z.coerce.number().int().positive().default(1),
  limit:           z.coerce.number().int().positive().default(10),
  search:          z.string().optional(),
  filter:          z.string().optional(),
  advancedFilter:  z.string().optional(),
});

export type ListCaAprendizQuery = z.infer<typeof listCaAprendizQuerySchema>;
