import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface GrauParentesco {
  GpaCodigo: number;
  GpaDescricao: string;
}

interface TabelaGrausProps {
  dados: GrauParentesco[];
  loading: boolean;
  error: string | null;
  onEdit: (item: GrauParentesco) => void;
  onDelete: (id: number) => void;
}

const TabelaGrauParentesco: React.FC<TabelaGrausProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<GrauParentesco>[] = [
    { header: "ID", cell: (item) => item.GpaCodigo },
    { header: "Descricao", cell: (item) => item.GpaDescricao },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.GpaCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum grau de parentesco cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.GpaCodigo)}
    />
  );
};

export default TabelaGrauParentesco;
