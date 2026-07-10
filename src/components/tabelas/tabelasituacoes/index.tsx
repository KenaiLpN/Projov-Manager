import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface SituacaoParticipante {
  StaCodigo: number;
  StaAbreviatura: string;
  StaDescricao: string;
  StaArea: string;
}

interface TabelaSituacoesProps {
  dados: SituacaoParticipante[];
  loading: boolean;
  error: string | null;
  onEdit: (item: SituacaoParticipante) => void;
  onDelete: (id: number) => void;
}

const TabelaSituacoes: React.FC<TabelaSituacoesProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<SituacaoParticipante>[] = [
    { header: "ID", cell: (item) => item.StaCodigo },
    {
      header: "Abreviacao",
      cell: (item) => item.StaAbreviatura,
      className: "font-semibold",
    },
    { header: "Descricao", cell: (item) => item.StaDescricao },
    { header: "Area", cell: (item) => item.StaArea },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.StaCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando situacoes..."
      emptyMessage="Nenhum registro encontrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.StaCodigo)}
    />
  );
};

export default TabelaSituacoes;
