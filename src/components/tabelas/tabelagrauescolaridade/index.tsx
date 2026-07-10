import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface GrauEscolaridade {
  GreCodigo: number;
  GreDescricao: string;
}

interface TabelaProps {
  dados: GrauEscolaridade[];
  loading: boolean;
  error: string | null;
  onEdit: (item: GrauEscolaridade) => void;
  onDelete: (id: number) => void;
}

const TabelaGrauEscolaridade: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<GrauEscolaridade>[] = [
    { header: "ID", cell: (item) => item.GreCodigo },
    { header: "Descricao", cell: (item) => item.GreDescricao },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.GreCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum grau de escolaridade cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.GreCodigo)}
    />
  );
};

export default TabelaGrauEscolaridade;
