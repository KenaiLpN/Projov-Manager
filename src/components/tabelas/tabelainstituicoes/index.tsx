import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface Instituicao {
  EscCodigo: number;
  EscNome: string | null;
  EscEmail: string | null;
  EscTelefone: string | null;
  EscCEP: string | null;
  EscEndereco: string | null;
  EscNumeroEndereco: string | null;
  EscBairro: string | null;
  EscCidade: string | null;
  EscEstado: string | null;
  EscComplemento: string | null;
  EscDiretor: string | null;
}

interface TabelaInstituicoesProps {
  instituicoes: Instituicao[];
  loading: boolean;
  error: string | null;
  onEdit: (instituicao: Instituicao) => void;
  onDelete: (id: number) => void;
}

const TabelaInstituicoes: React.FC<TabelaInstituicoesProps> = ({
  instituicoes,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Instituicao>[] = [
    { header: "Codigo", cell: (instituicao) => instituicao.EscCodigo },
    {
      header: "Instituicao",
      cell: (instituicao) => instituicao.EscNome ?? "-",
    },
    {
      header: "Endereco",
      cell: (instituicao) =>
        [
          instituicao.EscEndereco,
          instituicao.EscNumeroEndereco,
          instituicao.EscBairro,
        ]
          .filter(Boolean)
          .join(", ") || "-",
    },
    {
      header: "Cidade/UF",
      cell: (instituicao) =>
        [instituicao.EscCidade, instituicao.EscEstado].filter(Boolean).join(" / ") ||
        "-",
    },
  ];

  return (
    <CrudDataTable
      data={instituicoes}
      columns={columns}
      getRowKey={(instituicao) => instituicao.EscCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando instituicoes..."
      emptyMessage="Nenhuma instituicao cadastrada."
      onEdit={onEdit}
      onDelete={(instituicao) => onDelete(instituicao.EscCodigo)}
    />
  );
};

export default TabelaInstituicoes;
