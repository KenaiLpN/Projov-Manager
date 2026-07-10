import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface InstituicaoParceira {
  IpaCodigo: number;
  IpaDescricao: string | null;
  IpaEndereco: string | null;
  IpaNumeroEndereco: string | null;
  IpaComplemento: string | null;
  IpaBairro: string | null;
  IpaCidade: string | null;
  IpaEstado: string | null;
  IpaCEP: string | null;
  IpaEmail: string | null;
  IpaTelefone: string | null;
  IpaCelular: string | null;
  IpaSenha?: string | null;
  IpaNomeContato: string | null;
  IpaDataCadastro: string | null;
}

interface TabelaProps {
  dados: InstituicaoParceira[];
  loading: boolean;
  error: string | null;
  onEdit: (item: InstituicaoParceira) => void;
  onDelete: (id: number) => void;
}

const TabelaInstituicoesParceiras: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<InstituicaoParceira>[] = [
    { header: "ID", cell: (item) => item.IpaCodigo },
    { header: "Instituicao Parceira", cell: (item) => item.IpaDescricao || "-" },
    {
      header: "Endereco",
      cell: (item) =>
        [item.IpaEndereco, item.IpaNumeroEndereco, item.IpaComplemento, item.IpaBairro]
          .filter(Boolean)
          .join(", ") || "-",
    },
    {
      header: "Cidade/UF",
      cell: (item) => [item.IpaCidade, item.IpaEstado].filter(Boolean).join(" / ") || "-",
    },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.IpaCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhuma instituicao parceira cadastrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.IpaCodigo)}
    />
  );
};

export default TabelaInstituicoesParceiras;
