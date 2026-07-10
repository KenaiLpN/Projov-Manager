import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface Feriado {
  FerOrdem: number;
  FerData: string;
  FerDescricao: string;
  FerUnidade: number;
  FerTipo?: string;
}

interface TabelaProps {
  dados: Feriado[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Feriado) => void;
  onDelete: (item: Feriado) => void;
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const TabelaFeriados: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Feriado>[] = [
    { header: "ID", cell: (item) => item.FerOrdem },
    { header: "Data", cell: (item) => formatDate(item.FerData) },
    { header: "Descricao", cell: (item) => item.FerDescricao },
    { header: "Unidade", cell: (item) => item.FerUnidade },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.FerOrdem}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum feriado cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default TabelaFeriados;
