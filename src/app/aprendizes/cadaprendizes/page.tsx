"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Save, User, Briefcase, GraduationCap,
  FileText, MapPin, HeartPulse, Users, DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import * as caAprendizService from "@/services/caAprendizService";
import { CA_Aprendiz } from "@/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  try { return new Date(v).toISOString().split("T")[0]; } catch { return ""; }
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="col-span-full text-sm font-semibold text-[#133c86] uppercase tracking-wide border-b border-gray-200 pb-1 mt-4 mb-1">
      {title}
    </h3>
  );
}

function Field({
  label, name, value, onChange, type = "text", required = false,
  className = "", children, disabled = false,
}: {
  label: string; name: string; value: string | number | null | undefined;
  onChange: React.ChangeEventHandler<any>; type?: string; required?: boolean;
  className?: string; children?: React.ReactNode; disabled?: boolean;
}) {
  const baseInput =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86] disabled:bg-gray-50";
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseInput}
        />
      )}
    </div>
  );
}

function Select({
  label, name, value, onChange, required = false, className = "", children, disabled = false,
}: {
  label: string; name: string; value: string | number | null | undefined;
  onChange: React.ChangeEventHandler<HTMLSelectElement>; required?: boolean;
  className?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86] disabled:bg-gray-50"
      >
        {children}
      </select>
    </div>
  );
}

// ─── tab forms ───────────────────────────────────────────────────────────────

function TabJovem({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Identificação" />
      <Field label="Nome Completo" name="Apr_Nome" value={f.Apr_Nome} onChange={hc} required className="lg:col-span-2" />
      <Field label="Nome Social" name="Apr_NomeSocial" value={f.Apr_NomeSocial} onChange={hc} />
      <Field label="Data de Nascimento" name="Apr_DataDeNascimento" value={f.Apr_DataDeNascimento} onChange={hc} type="date" />
      <Select label="Sexo" name="Apr_Sexo" value={f.Apr_Sexo} onChange={hc}>
        <option value="">Selecione</option>
        <option value="M">Masculino</option>
        <option value="F">Feminino</option>
      </Select>
      <Select label="Estado Civil" name="AprEstadoCivil" value={f.AprEstadoCivil} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Solteiro">Solteiro(a)</option>
        <option value="Casado">Casado(a)</option>
        <option value="Divorciado">Divorciado(a)</option>
        <option value="Viúvo">Viúvo(a)</option>
        <option value="União Estável">União Estável</option>
      </Select>
      <Field label="Nacionalidade" name="Apr_Nacionalidade" value={f.Apr_Nacionalidade} onChange={hc} />
      <Field label="Naturalidade" name="Apr_Naturalidade" value={f.Apr_Naturalidade} onChange={hc} />
      <Select label="UF de Naturalidade" name="Apr_UF_Nat" value={f.Apr_UF_Nat} onChange={hc}>
        <option value="">UF</option>
        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </Select>

      <SectionTitle title="Filiação" />
      <Field label="Nome da Mãe" name="Apr_NomeMae" value={f.Apr_NomeMae} onChange={hc} className="lg:col-span-2" />
      <Field label="Nome do Pai" name="Apr_NomePai" value={f.Apr_NomePai} onChange={hc} className="lg:col-span-2" />

      <SectionTitle title="Escolaridade e Situação" />
      <Select label="É Estudante?" name="Apr_Estudante" value={f.Apr_Estudante} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Select label="Turno Escolar" name="Apr_TurnoEscolar" value={f.Apr_TurnoEscolar} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Manhã">Manhã</option>
        <option value="Tarde">Tarde</option>
        <option value="Noite">Noite</option>
        <option value="Integral">Integral</option>
      </Select>
      <Field label="Alistamento Militar" name="Apr_Exercito" value={f.Apr_Exercito} onChange={hc} />

      <SectionTitle title="Características" />
      <Field label="Deficiência" name="Apr_Deficiencia" value={f.Apr_Deficiencia} onChange={hc} />
      <Select label="Piercing" name="Apr_Piercing" value={f.Apr_Piercing} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Select label="Tatuagem" name="Apr_Tatuagem" value={f.Apr_Tatuagem} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>

      <SectionTitle title="Observações" />
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Observações</label>
        <textarea name="Apr_Observacoes" value={f.Apr_Observacoes ?? ""} onChange={hc} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Mensagem</label>
        <textarea name="Apr_Mensagem" value={f.Apr_Mensagem ?? ""} onChange={hc} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>
      <Field label="Validade da Mensagem" name="Apr_ValidadeMensagem" value={f.Apr_ValidadeMensagem} onChange={hc} type="date" />

      <SectionTitle title="Acesso" />
      <Field label="Senha de Acesso" name="Apr_senha" value={f.Apr_senha ?? ""} onChange={hc} type="password" />
    </div>
  );
}

function TabTrabalho({
  f, hc, unidades, instituicoes, turmas,
}: {
  f: CA_Aprendiz; hc: React.ChangeEventHandler<any>;
  unidades: any[]; instituicoes: any[]; turmas: any[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Dados do Contrato" />
      <Field label="Nº Sistema Externo" name="Apr_NumSistExterno" value={f.Apr_NumSistExterno} onChange={hc} />
      <Field label="CBO" name="Apr_CBO" value={f.Apr_CBO} onChange={hc} />
      <Select label="Tipo de Aprendizagem" name="Apr_TipoAprendizagem" value={f.Apr_TipoAprendizagem} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Empresarial">Empresarial</option>
        <option value="Doméstico">Doméstico</option>
        <option value="Rural">Rural</option>
      </Select>
      <Select label="Tipo de Contrato" name="Apr_TipoContrato" value={f.Apr_TipoContrato} onChange={hc}>
        <option value="">Selecione</option>
        <option value="CLT">CLT</option>
        <option value="Estágio">Estágio</option>
      </Select>
      <Field label="Horas Diárias" name="Apr_HorasDiarias" value={f.Apr_HorasDiarias} onChange={hc} type="number" />
      <Field label="Meses de Contrato" name="Apr_MesesContrato" value={f.Apr_MesesContrato} onChange={hc} type="number" />

      <SectionTitle title="Vínculo" />
      <Select label="Unidade" name="Apr_Unidade" value={f.Apr_Unidade} onChange={hc}>
        <option value="">Selecione</option>
        {unidades.map((u: any) => (
          <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
        ))}
      </Select>
      <Select label="Instituição Parceira" name="Apr_InstParceira" value={f.Apr_InstParceira} onChange={hc}>
        <option value="">Selecione</option>
        {instituicoes.map((i: any, idx: number) => (
          <option key={i.InstCodigo ?? i.id ?? idx} value={i.InstCodigo ?? i.id ?? ""}>
            {i.InstRazaoSocial ?? i.InstNome ?? i.nome}
          </option>
        ))}
      </Select>
      <Select label="Situação" name="Apr_Situacao" value={f.Apr_Situacao} onChange={hc}>
        <option value="">Selecione</option>
        <option value="1">Ativo</option>
        <option value="2">Concluído</option>
        <option value="3">Desligado</option>
        <option value="4">Transferido</option>
      </Select>

      <SectionTitle title="Datas" />
      <Field label="Início na Empresa" name="Apr_DataInicioEmpresa" value={f.Apr_DataInicioEmpresa} onChange={hc} type="date" />
      <Field label="Início da Aprendizagem" name="Apr_InicioAprendizagem" value={f.Apr_InicioAprendizagem} onChange={hc} type="date" />
      <Field label="Previsão de Término" name="Apr_PrevFimAprendizagem" value={f.Apr_PrevFimAprendizagem} onChange={hc} type="date" />
      <Field label="Término da Aprendizagem" name="Apr_FimAprendizagem" value={f.Apr_FimAprendizagem} onChange={hc} type="date" />
      <Field label="Data do Contrato" name="Apr_DataContrato" value={f.Apr_DataContrato} onChange={hc} type="date" />
      <Field label="Início das Férias" name="Apr_DataInicioFerias" value={f.Apr_DataInicioFerias} onChange={hc} type="date" />
      <Field label="Término das Férias" name="Apr_DataTerminoFerias" value={f.Apr_DataTerminoFerias} onChange={hc} type="date" />

      <SectionTitle title="Turmas e Currículo" />
      <Select label="Turma" name="Apr_Turma" value={f.Apr_Turma} onChange={hc}>
        <option value="">Selecione</option>
        {turmas.map((t: any) => (
          <option key={t.TurmaCodigo ?? t.id} value={t.TurmaCodigo ?? t.id}>
            {t.TurmaDescricao ?? t.nome}
          </option>
        ))}
      </Select>
      <Field label="Turma CCI" name="Apr_TurmaCCI" value={f.Apr_TurmaCCI} onChange={hc} type="number" />
      <Field label="Turma ENC" name="Apr_TurmaENC" value={f.Apr_TurmaENC} onChange={hc} type="number" />
      <Field label="Plano Curricular" name="Apr_PlanoCurricular" value={f.Apr_PlanoCurricular} onChange={hc} type="number" />
      <Field label="Área de Atuação" name="Apr_AreaAtuacao" value={f.Apr_AreaAtuacao} onChange={hc} type="number" />
      <Field label="Motivo Desligamento" name="AprMotivoDesligamento1" value={f.AprMotivoDesligamento1} onChange={hc} type="number" />
    </div>
  );
}

function TabEscolaridade({ f, hc, escolas }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any>; escolas: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Escola" />
      <Select label="Escola" name="AprCodEscola" value={f.AprCodEscola} onChange={hc} className="lg:col-span-2">
        <option value="">Selecione</option>
        {escolas.map((e: any) => (
          <option key={e.id_instituicao ?? e.id} value={e.id_instituicao ?? e.id}>
            {e.nome_instituicao ?? e.nome}
          </option>
        ))}
      </Select>
      <Field label="Nome da Escola (manual)" name="Apr_NomeEscola" value={f.Apr_NomeEscola} onChange={hc} className="lg:col-span-2" />
      <Field label="Horário Início" name="Apr_Escola_HInicio" value={f.Apr_Escola_HInicio} onChange={hc} />
      <Field label="Horário Término" name="Apr_Escola_HTermino" value={f.Apr_Escola_HTermino} onChange={hc} />
      <Select label="Escolaridade" name="Apr_Escolaridade" value={f.Apr_Escolaridade} onChange={hc}>
        <option value="">Selecione</option>
        <option value="1">Fundamental Incompleto</option>
        <option value="2">Fundamental Completo</option>
        <option value="3">Médio Incompleto</option>
        <option value="4">Médio Completo</option>
        <option value="5">Superior Incompleto</option>
        <option value="6">Superior Completo</option>
        <option value="7">Pós-Graduação</option>
      </Select>
    </div>
  );
}

function TabDocumentacao({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Carteira de Identidade" />
      <Field label="Número do RG" name="Apr_CarteiraDeIdentidade" value={f.Apr_CarteiraDeIdentidade} onChange={hc} />
      <Field label="Data de Emissão" name="Apr_DataEmissao_Ident" value={f.Apr_DataEmissao_Ident} onChange={hc} type="date" />
      <Field label="Órgão Emissor" name="Apr_OrgaoEmissor_Ident" value={f.Apr_OrgaoEmissor_Ident} onChange={hc} />
      <Select label="UF" name="Apr_UF_Ident" value={f.Apr_UF_Ident} onChange={hc}>
        <option value="">UF</option>
        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </Select>

      <SectionTitle title="CPF e PIS" />
      <Field label="CPF" name="Apr_CPF" value={f.Apr_CPF} onChange={hc} />
      <Field label="PIS" name="Apr_PIS" value={f.Apr_PIS} onChange={hc} />
      <Field label="PNE" name="Apr_PNE" value={f.Apr_PNE} onChange={hc} />

      <SectionTitle title="Carteira de Trabalho" />
      <Field label="Número da CTPS" name="Apr_CarteiraDeTrabalho" value={f.Apr_CarteiraDeTrabalho} onChange={hc} />
      <Field label="Série" name="Apr_Serie_Cartrab" value={f.Apr_Serie_Cartrab} onChange={hc} />
      <Field label="Data de Emissão" name="Apr_DataEmissao_CartTrab" value={f.Apr_DataEmissao_CartTrab} onChange={hc} type="date" />
      <Select label="UF" name="Apr_UF_CartTrab" value={f.Apr_UF_CartTrab} onChange={hc}>
        <option value="">UF</option>
        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </Select>

      <SectionTitle title="Título de Eleitor" />
      <Field label="Número do Título" name="Apr_NumeroTitulo" value={f.Apr_NumeroTitulo} onChange={hc} />
      <Field label="Seção" name="Apr_SecaoTitulo" value={f.Apr_SecaoTitulo} onChange={hc} />
      <Field label="Zona" name="Apr_ZonaTitulo" value={f.Apr_ZonaTitulo} onChange={hc} />
    </div>
  );
}

function TabEndereco({
  f, hc, buscaCEP,
}: {
  f: CA_Aprendiz; hc: React.ChangeEventHandler<any>; buscaCEP: (cep: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Endereço" />
      <Field
        label="CEP" name="Apr_CEP" value={f.Apr_CEP} onChange={hc}
      >
        <input
          name="Apr_CEP"
          value={f.Apr_CEP ?? ""}
          onChange={(e) => { hc(e); buscaCEP(e.target.value); }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]"
          placeholder="00000-000"
        />
      </Field>
      <Field label="Logradouro" name="Apr_Endereco" value={f.Apr_Endereco} onChange={hc} className="lg:col-span-2" />
      <Field label="Número" name="Apr_NumeroEndereco" value={f.Apr_NumeroEndereco} onChange={hc} />
      <Field label="Complemento" name="Apr_Complemento" value={f.Apr_Complemento} onChange={hc} />
      <Field label="Bairro" name="Apr_Bairro" value={f.Apr_Bairro} onChange={hc} />
      <Field label="Município" name="Apr_Cidade" value={f.Apr_Cidade} onChange={hc} />
      <Select label="UF" name="Apr_UF" value={f.Apr_UF} onChange={hc}>
        <option value="">UF</option>
        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </Select>

      <SectionTitle title="Contato" />
      <Field label="Telefone" name="Apr_Telefone" value={f.Apr_Telefone} onChange={hc} />
      <Field label="Celular" name="Apr_Celular" value={f.Apr_Celular} onChange={hc} />
      <Field label="E-mail" name="Apr_Email" value={f.Apr_Email} onChange={hc} type="email" />
      <Field label="Outros Telefones" name="Apr_OutrosTelefones" value={f.Apr_OutrosTelefones} onChange={hc} />

      <SectionTitle title="Tentativas de Contato" />
      <Field label="Tentativa Principal" name="Apr_TentativaContato" value={f.Apr_TentativaContato} onChange={hc} />
      <Field label="Tentativa 1" name="Apr_TentaticaContato01" value={f.Apr_TentaticaContato01} onChange={hc} />
      <Field label="Tentativa 2" name="Apr_TentaticaContato02" value={f.Apr_TentaticaContato02} onChange={hc} />
      <Field label="Tentativa 3" name="Apr_TentaticaContato03" value={f.Apr_TentaticaContato03} onChange={hc} />
    </div>
  );
}

function TabFamiliares({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Responsável / Familiar" />
      <Field label="Nome do Responsável" name="Apr_Responsavel" value={f.Apr_Responsavel} onChange={hc} className="lg:col-span-2" />
      <Field label="CPF do Responsável" name="Apr_Resp_CPF" value={f.Apr_Resp_CPF} onChange={hc} />
      <Select label="Estado Civil" name="Apr_Resp_EstadoCivil" value={f.Apr_Resp_EstadoCivil} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Solteiro">Solteiro(a)</option>
        <option value="Casado">Casado(a)</option>
        <option value="Divorciado">Divorciado(a)</option>
        <option value="Viúvo">Viúvo(a)</option>
        <option value="União Estável">União Estável</option>
      </Select>
      <Field label="Grau de Instrução" name="Apr_Resp_GrauInstrucao" value={f.Apr_Resp_GrauInstrucao} onChange={hc} />
      <Field label="Profissão" name="Apr_Resp_Profissao" value={f.Apr_Resp_Profissao} onChange={hc} />
      <Field label="Grau de Parentesco (cód.)" name="Apr_Resp_Parentesco" value={f.Apr_Resp_Parentesco} onChange={hc} type="number" />

      <SectionTitle title="Contato do Responsável" />
      <Field label="Telefone" name="Apr_Telefone_Resp" value={f.Apr_Telefone_Resp} onChange={hc} />
      <Field label="Celular" name="Apr_Celular_Resp" value={f.Apr_Celular_Resp} onChange={hc} />
      <Field label="Telefone de Contato" name="Apr_Telefone_Contato" value={f.Apr_Telefone_Contato} onChange={hc} />
      <Field label="Tipo de Contato" name="Apr_Tipo_Contato" value={f.Apr_Tipo_Contato} onChange={hc} />

      <SectionTitle title="Observações" />
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Observações sobre o Responsável</label>
        <textarea name="Apr_Resp_Observacoes" value={f.Apr_Resp_Observacoes ?? ""} onChange={hc} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>
    </div>
  );
}

function TabSocioEconomico({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Moradia" />
      <Select label="Situação da Residência" name="Apr_SituacaoResidencia" value={f.Apr_SituacaoResidencia} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Própria">Própria</option>
        <option value="Alugada">Alugada</option>
        <option value="Cedida">Cedida</option>
        <option value="Financiada">Financiada</option>
        <option value="Outros">Outros</option>
      </Select>
      <Field label="Valor do Aluguel (R$)" name="Apr_aluguel" value={f.Apr_aluguel} onChange={hc} type="number" />
      <Field label="Nº de Familiares" name="Apr_NumeroFamiliares" value={f.Apr_NumeroFamiliares} onChange={hc} type="number" />

      <SectionTitle title="Renda e Benefícios" />
      <Select label="Recebe Benefício?" name="Apr_recebebeneficio" value={f.Apr_recebebeneficio} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Field label="Tipo de Benefício" name="Apr_beneficio" value={f.Apr_beneficio} onChange={hc} />
      <Field label="Bolsa Família (R$)" name="Apr_BolsaFamilia" value={f.Apr_BolsaFamilia} onChange={hc} type="number" />
      <Field label="Pensão (R$)" name="Apr_pensao" value={f.Apr_pensao} onChange={hc} type="number" />
      <Field label="Outros (R$)" name="Apr_outros" value={f.Apr_outros} onChange={hc} type="number" />

      <SectionTitle title="Emprego Anterior" />
      <Select label="Carteira Assinada?" name="Apr_CarteiraAssinada" value={f.Apr_CarteiraAssinada} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Field label="Empresa" name="Apr_Empresa" value={f.Apr_Empresa} onChange={hc} />
      <Field label="Cargo" name="Apr_Cargo" value={f.Apr_Cargo} onChange={hc} />
      <Field label="Tempo de Permanência" name="Apr_TempoPermanencia" value={f.Apr_TempoPermanencia} onChange={hc} />
    </div>
  );
}

function TabSaude({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Medicamentos" />
      <Select label="Usa Medicamento?" name="Apr_UsaMedicamento" value={f.Apr_UsaMedicamento} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Field label="Nome do Medicamento" name="Apr_NomeMedicamento" value={f.Apr_NomeMedicamento} onChange={hc} />
      <Field label="Finalidade / Tipo" name="Apr_TipoMedicamento" value={f.Apr_TipoMedicamento} onChange={hc} />

      <SectionTitle title="Alergias" />
      <Select label="Tem Alergia?" name="Apr_Alergia" value={f.Apr_Alergia} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Field label="Qual Alergia?" name="Apr_TipoAlergia" value={f.Apr_TipoAlergia} onChange={hc} className="lg:col-span-2" />

      <SectionTitle title="Doenças" />
      <Select label="Tem Doença?" name="Apr_Doenca" value={f.Apr_Doenca} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Select>
      <Field label="Qual Doença?" name="Apr_NomeDoenca" value={f.Apr_NomeDoenca} onChange={hc} className="lg:col-span-2" />
    </div>
  );
}

// ─── date fields to format on load ───────────────────────────────────────────

const DATE_FIELDS: (keyof CA_Aprendiz)[] = [
  "Apr_DataDeNascimento", "Apr_DataInicioEmpresa", "Apr_InicioAprendizagem",
  "Apr_PrevFimAprendizagem", "Apr_FimAprendizagem", "Apr_DataContrato",
  "Apr_DataInicioFerias", "Apr_DataTerminoFerias",
  "Apr_DataEmissao_Ident", "Apr_DataEmissao_CartTrab", "Apr_ValidadeMensagem",
];

// ─── main component ───────────────────────────────────────────────────────────

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  const [formData, setFormData] = useState<CA_Aprendiz>({});

  const tabs = [
    { id: "jovem",         label: "Jovem",          icon: <User size={16} /> },
    { id: "trabalho",      label: "Trabalho",        icon: <Briefcase size={16} /> },
    { id: "escolaridade",  label: "Escolaridade",    icon: <GraduationCap size={16} /> },
    { id: "documentacao",  label: "Documentação",    icon: <FileText size={16} /> },
    { id: "endereco",      label: "Endereço",        icon: <MapPin size={16} /> },
    { id: "familiares",    label: "Familiares",      icon: <Users size={16} /> },
    { id: "socio",         label: "Sócio-Econômico", icon: <DollarSign size={16} /> },
    { id: "saude",         label: "Saúde",           icon: <HeartPulse size={16} /> },
  ];
  const [activeTab, setActiveTab] = useState("jovem");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const userStr = localStorage.getItem("projov_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.UsuTipo === "APRENDIZ") setIsAdmin(false);
      } catch {}
    }
    loadSelectData();
    if (editingId) fetchAprendiz(Number(editingId));
  }, [editingId]);

  const loadSelectData = useCallback(async () => {
    const CACHE = "cad_ca_select";
    try {
      const cached = sessionStorage.getItem(CACHE);
      if (cached) {
        const p = JSON.parse(cached);
        setUnidades(p.unidades);
        setInstituicoes(p.instituicoes);
        setEscolas(p.escolas);
        setTurmas(p.turmas);
        return;
      }
      const [resU, resI, resE, resT] = await Promise.all([
        api.get("/unidade?limit=1000"),
        api.get("/instituicoes-parceiras?limit=1000"),
        api.get("/instituicao?limit=1000"),
        api.get("/turmas?limit=1000"),
      ]);
      const data = {
        unidades: resU.data.data ?? [],
        instituicoes: resI.data.data ?? [],
        escolas: resE.data.data ?? [],
        turmas: resT.data.data ?? [],
      };
      sessionStorage.setItem(CACHE, JSON.stringify(data));
      setUnidades(data.unidades);
      setInstituicoes(data.instituicoes);
      setEscolas(data.escolas);
      setTurmas(data.turmas);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares", err);
    }
  }, []);

  const fetchAprendiz = async (id: number) => {
    setLoading(true);
    try {
      const record = await caAprendizService.getById(id);
      const formatted: any = { ...record };
      DATE_FIELDS.forEach((f) => {
        formatted[f] = fmtDate(formatted[f]);
      });
      // Clear password from response
      formatted.Apr_senha = "";
      setFormData(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do aprendiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "Apr_Unidade", "Apr_InstParceira", "Apr_Turma", "Apr_TurmaCCI", "Apr_TurmaENC",
      "Apr_PlanoCurricular", "Apr_AreaAtuacao", "Apr_HorasDiarias", "Apr_MesesContrato",
      "AprMotivoDesligamento1", "Apr_Situacao", "Apr_Escolaridade",
      "Apr_Resp_Parentesco", "AprCodEscola",
      "Apr_aluguel", "Apr_NumeroFamiliares", "Apr_BolsaFamilia", "Apr_pensao", "Apr_outros",
    ];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? (value === "" ? null : Number(value))
        : (value === "" ? null : value),
    }));
  }, []);

  const handleSave = async () => {
    if (!formData.Apr_Nome) {
      toast.error("O nome completo é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await caAprendizService.update(Number(editingId), formData);
        toast.success("Aprendiz atualizado com sucesso!");
      } else {
        await caAprendizService.create(formData);
        toast.success("Aprendiz cadastrado com sucesso!");
      }
      if (isAdmin) router.push("/aprendizes");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar aprendiz.");
    } finally {
      setLoading(false);
    }
  };

  const buscaCEP = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          Apr_Endereco: data.logradouro || prev.Apr_Endereco,
          Apr_Bairro: data.bairro || prev.Apr_Bairro,
          Apr_Cidade: data.localidade || prev.Apr_Cidade,
          Apr_UF: data.uf || prev.Apr_UF,
        }));
      }
    } catch {}
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer">
                  <ArrowLeft size={32} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#133c86]">
                  {editingId ? "Edição de Aprendiz" : "Novo Aprendiz"}
                </h1>
                <p className="text-sm text-gray-500">
                  {formData.Apr_Nome || (editingId ? "Carregando..." : "Preencha os dados abaixo")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button onClick={() => router.back()}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
              )}
              <button onClick={handleSave} disabled={loading}
                className="px-5 py-2 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                {loading ? "Processando..." : (<><Save size={16} />{editingId ? "Atualizar" : "Salvar"}</>)}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          {/* Tab bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-1 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#133c86] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#133c86]"
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-24">
            {activeTab === "jovem"        && <TabJovem f={formData} hc={handleChange} />}
            {activeTab === "trabalho"     && <TabTrabalho f={formData} hc={handleChange} unidades={unidades} instituicoes={instituicoes} turmas={turmas} />}
            {activeTab === "escolaridade" && <TabEscolaridade f={formData} hc={handleChange} escolas={escolas} />}
            {activeTab === "documentacao" && <TabDocumentacao f={formData} hc={handleChange} />}
            {activeTab === "endereco"     && <TabEndereco f={formData} hc={handleChange} buscaCEP={buscaCEP} />}
            {activeTab === "familiares"   && <TabFamiliares f={formData} hc={handleChange} />}
            {activeTab === "socio"        && <TabSocioEconomico f={formData} hc={handleChange} />}
            {activeTab === "saude"        && <TabSaude f={formData} hc={handleChange} />}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <button
              disabled={tabs.findIndex(t => t.id === activeTab) === 0}
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx > 0) { setActiveTab(tabs[idx - 1].id); window.scrollTo({ top: 0, behavior: "smooth" }); }
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-30">
              <ArrowLeft size={16} /> Anterior
            </button>
            {tabs.findIndex(t => t.id === activeTab) < tabs.length - 1 ? (
              <button
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  setActiveTab(tabs[idx + 1].id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#133c86] text-white font-medium hover:bg-[#0f2e6b] transition-all">
                Próximo <div className="rotate-180"><ArrowLeft size={16} /></div>
              </button>
            ) : (
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-2 px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50">
                <Save size={16} /> {editingId ? "Finalizar Atualização" : "Finalizar Cadastro"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CadAprendizes() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#133c86]" />
      </div>
    }>
      <CadastroForm />
    </Suspense>
  );
}
