import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";
import { TableStatusBadge } from "../TableStatusBadge";

export interface RamoAtividade {
  IdRamo: number;
  Descricao: string;
  CodigoCNAE?: string;
  Observacao?: string;
  Ativo?: boolean;
}

interface TabelaProps {
  dados: RamoAtividade[];
  loading: boolean;
  error: string | null;
  onEdit: (item: RamoAtividade) => void;
  onDelete: (id: number) => void;
}

const TabelaRamosAtividade: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<RamoAtividade>[] = [
    { header: "ID", cell: (item) => item.IdRamo },
    { header: "Descricao", cell: (item) => item.Descricao },
    { header: "CNAE", cell: (item) => item.CodigoCNAE || "-" },
    {
      header: "Status",
      cell: (item) => <TableStatusBadge active={Boolean(item.Ativo)} />,
    },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.IdRamo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum ramo de atividade cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.IdRamo)}
    />
  );
};

export default TabelaRamosAtividade;
