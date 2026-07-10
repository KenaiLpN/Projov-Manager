import React from "react";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";

export interface RegistroGI {
  GICodigo: number;
  GIRazaoSocial?: string;
  GINomeFantasia?: string;
  GICNPJ?: string;
  GICidade?: string;
  GIUF?: string;
  GITelefone?: string;
  GIEmail?: string;
}

interface TabelaProps {
  dados: RegistroGI[];
  loading: boolean;
  error: string | null;
  onEdit: (item: RegistroGI) => void;
  onDelete: (id: number) => void;
}

const TabelaRegistroGI: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<RegistroGI>[] = [
    { header: "Codigo", cell: (item) => item.GICodigo },
    {
      header: "Razao Social / Nome Fantasia",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold">{item.GIRazaoSocial || "-"}</span>
          <span className="text-xs italic text-gray-400">
            {item.GINomeFantasia || "-"}
          </span>
        </div>
      ),
    },
    { header: "CNPJ", cell: (item) => item.GICNPJ || "-" },
    {
      header: "Cidade/UF",
      cell: (item) =>
        item.GICidade && item.GIUF ? `${item.GICidade}/${item.GIUF}` : item.GICidade || "-",
    },
    { header: "Telefone", cell: (item) => item.GITelefone || "-" },
    { header: "E-mail", cell: (item) => item.GIEmail || "-" },
  ];

  return (
    <CrudDataTable
      data={dados}
      columns={columns}
      getRowKey={(item) => item.GICodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando..."
      emptyMessage="Nenhum registro GI cadastrado."
      errorMessage="Erro"
      onEdit={onEdit}
      onDelete={(item) => onDelete(item.GICodigo)}
    />
  );
};

export default TabelaRegistroGI;
