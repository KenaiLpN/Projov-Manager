import {
  BookOpen,
  Calendar,
  Eye,
  FileText,
  LayoutGrid,
  MapPin,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CA_Aprendiz } from "@/types";
import { TableActionButton } from "./TableActionButton";

export type AprendizTableRow = CA_Aprendiz & {
  unidadeNome?: string | null;
  situacaoDescricao?: string | null;
  Apr_Telefone?: string | null;
};

interface AprendizesTableProps {
  aprendizes: AprendizTableRow[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isEducadorAccess: boolean;
  onOpenTab: (id: number, tab: string) => void;
  onEdit: (id: number) => void;
  onDelete: (aprendiz: AprendizTableRow) => void;
}

const columns = [
  "Codigo",
  "Nome",
  "Telefone",
  "Sexo",
  "Situacao",
  "E-mail",
  "Alocacoes",
  "Capacitacoes",
  "Avaliacao",
  "Calendario",
  "Cal. Turma",
  "Emitir Cal.",
];

function EmptyCell() {
  return <span className="text-gray-400 dark:text-[var(--prosis-muted)]">-</span>;
}

function IconAction({
  title,
  children,
  className,
  onClick,
}: {
  title: string;
  children: ReactNode;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function AprendizesTable({
  aprendizes,
  loading,
  canEdit,
  canDelete,
  isEducadorAccess,
  onOpenTab,
  onEdit,
  onDelete,
}: AprendizesTableProps) {
  const hasActions = canEdit || canDelete || isEducadorAccess;

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#d9e7f6]">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column}
                className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#244b7d] ${
                  index === 0 ? "rounded-tl-lg" : ""
                } ${!hasActions && index === columns.length - 1 ? "rounded-tr-lg" : ""}`}
              >
                {column}
              </th>
            ))}
            {hasActions && (
              <th className="rounded-tr-lg px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#244b7d]">
                Acoes
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="p-8 text-center font-medium text-[#244b7d] dark:text-[var(--prosis-brand)]"
              >
                Carregando dados...
              </td>
            </tr>
          ) : aprendizes.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="p-8 text-center text-gray-500 dark:text-[var(--prosis-muted)]"
              >
                Nenhum aprendiz encontrado.
              </td>
            </tr>
          ) : (
            aprendizes.map((aprendiz) => {
              const id = aprendiz.Apr_Codigo;
              if (!id) return null;

              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {id}
                  </td>
                  <td className="max-w-[220px] px-6 py-4 text-sm font-medium text-gray-700">
                    <span className="block truncate">{aprendiz.Apr_Nome || "-"}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {aprendiz.Apr_Telefone || aprendiz.Apr_Celular || <EmptyCell />}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {aprendiz.Apr_Sexo || <EmptyCell />}
                  </td>
                  <td className="max-w-[180px] px-6 py-4 text-sm text-gray-500">
                    <span className="block truncate">
                      {aprendiz.situacaoDescricao || <EmptyCell />}
                    </span>
                  </td>
                  <td className="max-w-[220px] px-6 py-4 text-sm text-gray-500">
                    <span className="block truncate">
                      {aprendiz.Apr_Email || "Nao informado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Alocacoes"
                      onClick={() => onOpenTab(id, "alocacoes")}
                      className="text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    >
                      <MapPin size={16} />
                    </IconAction>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Capacitacoes"
                      onClick={() => onOpenTab(id, "capacitacoes")}
                      className="text-green-600 hover:border-green-200 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
                    >
                      <BookOpen size={16} />
                    </IconAction>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Avaliacao"
                      onClick={() => onOpenTab(id, "avaliacao")}
                      className="text-amber-600 hover:border-amber-200 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                    >
                      <Star size={16} />
                    </IconAction>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Calendario"
                      onClick={() => onOpenTab(id, "calendario")}
                      className="text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Calendar size={16} />
                    </IconAction>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Calcular calendario da turma"
                      onClick={() => onOpenTab(id, "calendario-turma")}
                      className="text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <LayoutGrid size={16} />
                    </IconAction>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <IconAction
                      title="Emitir calendario"
                      onClick={() => onOpenTab(id, "emitir-calendario")}
                      className="text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <FileText size={16} />
                    </IconAction>
                  </td>
                  {hasActions && (
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {isEducadorAccess ? (
                          <button
                            type="button"
                            title="Detalhes"
                            aria-label="Detalhes"
                            onClick={() => onEdit(id)}
                            className="prosis-table-action cursor-pointer text-[#244b7d]"
                          >
                            <Eye size={16} strokeWidth={2.25} aria-hidden="true" />
                          </button>
                        ) : (
                          canEdit && (
                            <TableActionButton variant="edit" onClick={() => onEdit(id)} />
                          )
                        )}
                        {canDelete && (
                          <TableActionButton
                            variant="delete"
                            onClick={() => onDelete(aprendiz)}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
