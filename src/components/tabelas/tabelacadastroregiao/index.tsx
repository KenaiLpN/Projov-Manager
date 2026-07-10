import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface CadastroRegiao {
  CodRegiao: number;
  DescRegiao: string;
}

interface TabelaProps {
  dados: CadastroRegiao[];
  loading: boolean;
  error: string | null;
  onEdit: (item: CadastroRegiao) => void;
  onDelete: (id: number) => void;
}

const TabelaCadastroRegiao: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<CadastroRegiao>[] = [
    { header: "ID", cell: (item) => item.CodRegiao },
    { header: "Descricao", cell: (item) => item.DescRegiao },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.CodRegiao}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhuma regiao cadastrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.CodRegiao)}
    />
  );
};

export default TabelaCadastroRegiao;
