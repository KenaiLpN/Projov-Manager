import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface Ocorrencia {
  OcoCodigo: number;
  OcoDescricao: string | null;
  OcoTipo: string | null;
}

interface TabelaOcorrenciasProps {
  dados: Ocorrencia[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Ocorrencia) => void;
  onDelete: (id: number) => void;
}

const TabelaOcorrencias: React.FC<TabelaOcorrenciasProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Ocorrencia>[] = [
    { header: "Codigo", cell: (item) => item.OcoCodigo },
    {
      header: "Descricao",
      cell: (item) => item.OcoDescricao || "-",
      className: "max-w-xs truncate",
    },
    { header: "Tipo", cell: (item) => item.OcoTipo || "-" },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.OcoCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando ocorrencias..."
      emptyMessage="Nenhuma ocorrencia registrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.OcoCodigo)}
    />
  );
};

export default TabelaOcorrencias;
