import React from "react";
import { Unidade } from "@/types";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

interface TabelaUnidadesProps {
  unidades: Unidade[];
  loading: boolean;
  error: string | null;
  onEdit: (unidade: Unidade) => void;
  onDelete: (id: number) => void;
}

const TabelaUnidades: React.FC<TabelaUnidadesProps> = ({
  unidades,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Unidade>[] = [
    { header: "Codigo", cell: (unidade) => unidade.UniCodigo },
    { header: "Campus", cell: (unidade) => unidade.UniNome ?? "-" },
    {
      header: "Endereco",
      cell: (unidade) =>
        [unidade.UniEndereco, unidade.UniNumeroEndereco].filter(Boolean).join(", ") || "-",
    },
    { header: "Bairro", cell: (unidade) => unidade.UniBairro ?? "-" },
    {
      header: "Cidade/UF",
      cell: (unidade) =>
        [unidade.UniCidade, unidade.UniEstado].filter(Boolean).join(" - ") || "-",
    },
    { header: "Telefone", cell: (unidade) => unidade.UniTelefone ?? "-" },
  ];

  return (
    <CrudDataTable
      data={unidades}
      columns={columns}
      getRowKey={(unidade) => unidade.UniCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando unidades..."
      emptyMessage="Nenhuma unidade cadastrada."
      onEdit={onEdit}
      onDelete={(unidade) => onDelete(unidade.UniCodigo)}
    />
  );
};

export default TabelaUnidades;
