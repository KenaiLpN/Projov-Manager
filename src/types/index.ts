// ─── CA_Aprendiz ──────────────────────────────────────────────────────────────

export interface CA_Aprendiz {
  // PK
  Apr_Codigo?: number | null;

  // Dados pessoais
  Apr_Nome?: string | null;
  Apr_NomeSocial?: string | null;
  Apr_DataDeNascimento?: string | null;
  Apr_Sexo?: string | null;
  AprEstadoCivil?: string | null;
  Apr_Nacionalidade?: string | null;
  Apr_Naturalidade?: string | null;
  Apr_UF_Nat?: string | null;
  Apr_NomeMae?: string | null;
  Apr_NomePai?: string | null;
  Apr_Exercito?: string | null;
  Apr_Estudante?: string | null;
  Apr_TurnoEscolar?: string | null;
  Apr_Deficiencia?: string | null;
  Apr_Piercing?: string | null;
  Apr_Tatuagem?: string | null;
  Apr_Observacoes?: string | null;
  Apr_Mensagem?: string | null;
  Apr_ValidadeMensagem?: string | null;

  // Vínculo e contrato
  Apr_NumSistExterno?: string | null;
  Apr_CBO?: string | null;
  Apr_TipoAprendizagem?: string | null;
  Apr_TipoContrato?: string | null;
  Apr_InstParceira?: number | null;
  Apr_Unidade?: number | null;
  Apr_DataInicioEmpresa?: string | null;
  Apr_InicioAprendizagem?: string | null;
  Apr_PrevFimAprendizagem?: string | null;
  Apr_FimAprendizagem?: string | null;
  Apr_DataContrato?: string | null;
  Apr_DataInicioFerias?: string | null;
  Apr_DataTerminoFerias?: string | null;
  Apr_Turma?: number | null;
  Apr_TurmaCCI?: number | null;
  Apr_TurmaENC?: number | null;
  Apr_PlanoCurricular?: number | null;
  Apr_AreaAtuacao?: number | null;
  Apr_HorasDiarias?: number | null;
  Apr_MesesContrato?: number | null;
  AprMotivoDesligamento1?: number | null;
  Apr_Situacao?: number | null;

  // Escola
  AprCodEscola?: number | null;
  Apr_NomeEscola?: string | null;
  Apr_Escola_HInicio?: string | null;
  Apr_Escola_HTermino?: string | null;
  Apr_Escolaridade?: number | null;

  // Documentação
  Apr_CarteiraDeIdentidade?: string | null;
  Apr_DataEmissao_Ident?: string | null;
  Apr_OrgaoEmissor_Ident?: string | null;
  Apr_UF_Ident?: string | null;
  Apr_CPF?: string | null;
  Apr_PIS?: string | null;
  Apr_CarteiraDeTrabalho?: string | null;
  Apr_Serie_Cartrab?: string | null;
  Apr_DataEmissao_CartTrab?: string | null;
  Apr_UF_CartTrab?: string | null;
  Apr_PNE?: string | null;
  Apr_NumeroTitulo?: string | null;
  Apr_SecaoTitulo?: string | null;
  Apr_ZonaTitulo?: string | null;

  // Endereço e contato
  Apr_CEP?: string | null;
  Apr_Endereco?: string | null;
  Apr_NumeroEndereco?: string | null;
  Apr_Complemento?: string | null;
  Apr_Bairro?: string | null;
  Apr_Cidade?: string | null;
  Apr_UF?: string | null;
  Apr_Telefone?: string | null;
  Apr_Celular?: string | null;
  Apr_Email?: string | null;
  Apr_OutrosTelefones?: string | null;
  Apr_TentativaContato?: string | null;
  Apr_TentaticaContato01?: string | null;
  Apr_TentaticaContato02?: string | null;
  Apr_TentaticaContato03?: string | null;

  // Familiar / responsável
  Apr_Responsavel?: string | null;
  Apr_Resp_CPF?: string | null;
  Apr_Resp_EstadoCivil?: string | null;
  Apr_Resp_GrauInstrucao?: string | null;
  Apr_Resp_Profissao?: string | null;
  Apr_Telefone_Resp?: string | null;
  Apr_Celular_Resp?: string | null;
  Apr_Telefone_Contato?: string | null;
  Apr_Tipo_Contato?: string | null;
  Apr_Resp_Parentesco?: number | null;
  Apr_Resp_Observacoes?: string | null;

  // Sócio-econômico
  Apr_SituacaoResidencia?: string | null;
  Apr_aluguel?: number | null;
  Apr_NumeroFamiliares?: number | null;
  Apr_beneficio?: string | null;
  Apr_recebebeneficio?: string | null;
  Apr_BolsaFamilia?: number | null;
  Apr_pensao?: number | null;
  Apr_outros?: number | null;
  Apr_CarteiraAssinada?: string | null;
  Apr_Empresa?: string | null;
  Apr_Cargo?: string | null;
  Apr_TempoPermanencia?: string | null;

  // Saúde
  Apr_UsaMedicamento?: string | null;
  Apr_NomeMedicamento?: string | null;
  Apr_TipoMedicamento?: string | null;
  Apr_Alergia?: string | null;
  Apr_TipoAlergia?: string | null;
  Apr_Doenca?: string | null;
  Apr_NomeDoenca?: string | null;

  // Acesso
  Apr_senha?: string | null;

  // Auditoria (read-only, preenchido pelo backend)
  Apr_DataCadastro?: string | null;
  Apr_UsuarioCadastro?: string | null;
  Apr_UsuarioDataCadastro?: string | null;
  Apr_UsuarioAlteracao?: string | null;
  Apr_UsuarioDataAlteracao?: string | null;
}

export interface CA_AprendizStats {
  total: number;
  working: number;
  available: number;
}

export interface CA_AprendizListResponse {
  data: CA_Aprendiz[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ──────────────────────────────────────────────────────────────────────────────

export type FormValues = {
  email: string;
  password: string;
};
export interface LoginResponse {
  data: string[];
  msg: string;
}
export interface Usuario {
  UsuCodigo: string;
  UsuNome: string | null;
  UsuEmail: string | null;
  UsuTipo: string | null;
  cpf: string | null;
  chk_ativo: boolean;
  id_usuario?: number; 
  criado_em?: string;
  atualizado_em?: string;
  confirmacao_senha?: string;
}
export interface Unidade {
  UniCodigo: number;
  UniNome: string | null;
  UniEndereco: string | null;
  UniNumeroEndereco: string | null;
  UniComplemento: string | null;
  UniBairro: string | null;
  UniCEP: string | null;
  UniCidade: string | null;
  UniEstado: string | null;
  UniTelefone: string | null;
  UniCGC: string | null;
  UniEnderecoWeb: string | null;
  UniEmailPadraoEnvio: string | null;
  UniRepresentanteLegal: string | null;
  UniRepresentanteCargo: string | null;
  UniTipo: string | null;
  UniDataRefPesquisa?: string | null;
}
export interface InstituicaoEnsino {
  id_instituicao: number;
  nome_instituicao: string;
  email: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;
  responsavel?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  chk_ativo: boolean;
  created_at?: string;
}