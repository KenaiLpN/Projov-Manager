import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface MotivoDesligamento {
  MotCodigo: number;
  MotDescricao: string;
}

interface TabelaProps {
  dados: MotivoDesligamento[];
  loading: boolean;
  error: string | null;
  onEdit: (item: MotivoDesligamento) => void;
  onDelete: (id: number) => void;
}

const TabelaMotivoDesligamento: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<MotivoDesligamento>[] = [
    { header: "ID", cell: (item) => item.MotCodigo },
    { header: "Descricao", cell: (item) => item.MotDescricao },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.MotCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum motivo cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.MotCodigo)}
    />
  );
};

export default TabelaMotivoDesligamento;
