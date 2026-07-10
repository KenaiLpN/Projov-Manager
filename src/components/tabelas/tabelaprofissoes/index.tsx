import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface Profissao {
  ProfCodigo: number;
  ProfDescricao: string;
}

interface TabelaProfissoesProps {
  dados: Profissao[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Profissao) => void;
  onDelete: (id: number) => void;
}

const TabelaProfissoes: React.FC<TabelaProfissoesProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Profissao>[] = [
    { header: "ID", cell: (item) => item.ProfCodigo },
    {
      header: "Nome da Profissao",
      cell: (item) => item.ProfDescricao,
      className: "font-semibold",
    },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.ProfCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando profissoes..."
      emptyMessage="Nenhuma profissao cadastrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.ProfCodigo)}
    />
  );
};

export default TabelaProfissoes;
