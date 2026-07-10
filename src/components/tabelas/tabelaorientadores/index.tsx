import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface Orientador {
  OriCodigo: number;
  OriUnidadeParceiro: number;
  OriNome: string;
  OriTelefone?: string;
  OriEmail?: string;
  UnidadeNome?: string;
}

interface TabelaProps {
  dados: Orientador[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Orientador) => void;
  onDelete: (id: number) => void;
}

const TabelaOrientadores: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Orientador>[] = [
    { header: "Nome do Orientador", cell: (item) => item.OriNome },
    {
      header: "Unidade de Atuacao",
      cell: (item) => item.UnidadeNome || `Unidade ID: ${item.OriUnidadeParceiro}`,
    },
    { header: "E-mail", cell: (item) => item.OriEmail || "-" },
    { header: "Telefone", cell: (item) => item.OriTelefone || "-" },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.OriCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum orientador cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.OriCodigo)}
    />
  );
};

export default TabelaOrientadores;
