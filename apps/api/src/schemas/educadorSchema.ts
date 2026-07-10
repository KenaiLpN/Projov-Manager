import { z } from "zod";

export const createEducadorBodySchema = z.object({
  EducNome: z.string().max(50).optional().nullable(),
  EducSexo: z.string().max(1).optional().nullable(),
  EducEndereco: z.string().max(50).optional().nullable(),
  EducNumeroEndereco: z.string().max(6).optional().nullable(),
  EducComplemento: z.string().max(20).optional().nullable(),
  EducBairro: z.string().max(50).optional().nullable(),
  EducCidade: z.string().max(30).optional().nullable(),
  EducUF: z.string().max(2).optional().nullable(),
  EducCEP: z.string().max(9).optional().nullable(),
  EducTelefone: z.string().max(10).optional().nullable(),
  EducTelefoneCelular: z.string().max(11).optional().nullable(),
  EducEMail: z.string().email().max(60).optional().nullable(),
  EducDataNascimento: z.string().nullable().optional(),
  EducNaturalidade: z.string().max(30).optional().nullable(),
  EducUFNaturalidade: z.string().max(2).optional().nullable(),
  EducEstadoCivil: z.string().max(1).optional().nullable(),
  EducNomedoPai: z.string().max(50).optional().nullable(),
  EducNomedaMae: z.string().max(50).optional().nullable(),
  EducSituacao: z.string().max(1).optional().nullable(),
  EducDataEntrada: z.string().nullable().optional(),
  EducDataSaida: z.string().nullable().optional(),
  EducTipoAdmissao: z.string().max(25).optional().nullable(),
  EducIdentidade: z.string().max(15).optional().nullable(),
  EducExpedIdentidade: z.string().max(8).optional().nullable(),
  EducCPF: z.string().max(11).optional().nullable(),
  EducTitulodeEleitor: z.string().max(15).optional().nullable(),
  EducZonaEleitoral: z.string().max(4).optional().nullable(),
  EducSecaoEleitoral: z.string().max(4).optional().nullable(),
  EducMunEleitoral: z.string().max(30).optional().nullable(),
  EducSenha: z.string().max(200).optional().nullable(),
  EducCartprofissional: z.string().max(20).optional().nullable(),
  EducSerieCartProfissional: z.string().max(5).optional().nullable(),
  EducObservacoes: z.string().max(255).optional().nullable(),
  EducGrauInstrucao: z.number().int().optional().nullable(),
  EducNumSistInterno: z.string().max(15).optional().nullable(),
  EducTipo: z.string().max(1).optional().nullable(),
});

export type CreateEducadorBody = z.infer<typeof createEducadorBodySchema>;

export const updateEducadorBodySchema = createEducadorBodySchema.partial();
export type UpdateEducadorBody = z.infer<typeof updateEducadorBodySchema>;

export const listEducadorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});

export type ListEducadorQuery = z.infer<typeof listEducadorQuerySchema>;
