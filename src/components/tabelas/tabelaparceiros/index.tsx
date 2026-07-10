import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";
import { TableStatusBadge } from "../TableStatusBadge";

export interface Parceiro {
  ParCodigo: number;
  ParDescricao: string;
  ParNomeFantasia?: string;
  ParCNPJ?: string;
  ParCidade?: string;
  ParEstado?: string;
  ParSituacao?: string;
  RamoDescricao?: string;
}

interface TabelaProps {
  dados: Parceiro[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Parceiro) => void;
  onDelete: (id: number) => void;
}

const TabelaParceiros: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Parceiro>[] = [
    { header: "Codigo", cell: (item) => item.ParCodigo },
    {
      header: "Razao Social / Nome",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold">{item.ParDescricao}</span>
          <span className="text-xs italic text-gray-400">
            {item.ParNomeFantasia || "-"}
          </span>
        </div>
      ),
    },
    { header: "CNPJ", cell: (item) => item.ParCNPJ || "-" },
    { header: "Ramo", cell: (item) => item.RamoDescricao || "-" },
    {
      header: "Cidade/UF",
      cell: (item) =>
        item.ParCidade && item.ParEstado ? `${item.ParCidade}/${item.ParEstado}` : "-",
    },
    {
      header: "Status",
      cell: (item) => <TableStatusBadge active={item.ParSituacao === "A"} />,
    },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.ParCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhuma empresa cadastrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.ParCodigo)}
    />
  );
};

export default TabelaParceiros;
