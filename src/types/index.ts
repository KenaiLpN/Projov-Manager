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