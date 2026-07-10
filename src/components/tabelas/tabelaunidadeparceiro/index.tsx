import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface UnidadeParceiro {
  ParUniCodigo: number;
  ParUniCodigoParceiro: number;
  ParUniDescricao: string;
  ParUniCNPJ?: string;
  ParUniCidade?: string;
  ParUniEstado?: string;
  EmpresaNome?: string;
}

interface TabelaProps {
  dados: UnidadeParceiro[];
  loading: boolean;
  error: string | null;
  onEdit: (item: UnidadeParceiro) => void;
  onDelete: (id: number, parceiroId: number) => void;
}

const TabelaUnidadeParceiro: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<UnidadeParceiro>[] = [
    {
      header: "Empresa",
      cell: (item) => item.EmpresaNome || `PID: ${item.ParUniCodigoParceiro}`,
    },
    { header: "Descricao da Unidade", cell: (item) => item.ParUniDescricao },
    { header: "CNPJ", cell: (item) => item.ParUniCNPJ || "-" },
    {
      header: "Cidade/UF",
      cell: (item) =>
        item.ParUniCidade && item.ParUniEstado
          ? `${item.ParUniCidade}/${item.ParUniEstado}`
          : "-",
    },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => `${item.ParUniCodigo}-${item.ParUniCodigoParceiro}`}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhuma unidade cadastrada."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.ParUniCodigo, item.ParUniCodigoParceiro)}
    />
  );
};

export default TabelaUnidadeParceiro;
