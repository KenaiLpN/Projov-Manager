import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface StatusEncaminhamento {
  Ste_Codigo: string;
  Ste_Descricao: string;
}

interface TabelaProps {
  dados: StatusEncaminhamento[];
  loading: boolean;
  error: string | null;
  onEdit: (item: StatusEncaminhamento) => void;
  onDelete: (id: string) => void;
}

const TabelaStatusEncaminhamento: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<StatusEncaminhamento>[] = [
    { header: "ID", cell: (item) => item.Ste_Codigo },
    { header: "Descricao", cell: (item) => item.Ste_Descricao },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.Ste_Codigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum status cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.Ste_Codigo)}
    />
  );
};

export default TabelaStatusEncaminhamento;
