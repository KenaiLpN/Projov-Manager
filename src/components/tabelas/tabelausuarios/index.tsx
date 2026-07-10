import React from "react";
import { getRoleLabel } from "@/utils/roles";
import { Usuario } from "@/types";
import { CrudDataTable, CrudDataTableColumn } from "../CrudDataTable";
import { TableStatusBadge } from "../TableStatusBadge";

interface TabelaUsuariosProps {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: string) => void;
}

const TabelaUsuarios: React.FC<TabelaUsuariosProps> = ({
  usuarios,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const columns: CrudDataTableColumn<Usuario>[] = [
    { header: "Codigo", cell: (usuario) => usuario.UsuCodigo },
    { header: "Nome", cell: (usuario) => usuario.UsuNome ?? "-" },
    { header: "Funcao", cell: (usuario) => getRoleLabel(usuario.UsuTipo) },
    { header: "Email", cell: (usuario) => usuario.UsuEmail ?? "-" },
    {
      header: "Status",
      cell: (usuario) => <TableStatusBadge active={usuario.chk_ativo} />,
    },
  ];

  return (
    <CrudDataTable
      data={usuarios}
      columns={columns}
      getRowKey={(usuario) => usuario.UsuCodigo}
      loading={loading}
      error={error}
      loadingMessage="Carregando usuarios..."
      emptyMessage="Nenhum usuario cadastrado."
      onEdit={onEdit}
      onDelete={(usuario) => onDelete(usuario.UsuCodigo)}
    />
  );
};

export default TabelaUsuarios;
