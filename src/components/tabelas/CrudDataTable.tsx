import type { Key, ReactNode } from "react";
import { TableActionButton } from "./TableActionButton";

export interface CrudDataTableColumn<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface CrudDataTableProps<T> {
  data: T[];
  columns: CrudDataTableColumn<T>[];
  getRowKey: (item: T) => Key;
  loading: boolean;
  error: string | null;
  loadingMessage: string;
  emptyMessage: string;
  errorMessage?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function CrudDataTable<T>({
  data,
  columns,
  getRowKey,
  loading,
  error,
  loadingMessage,
  emptyMessage,
  errorMessage = "Erro ao buscar",
  onEdit,
  onDelete,
}: CrudDataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-8 text-center font-medium text-[#244b7d] dark:text-[var(--prosis-brand)]">
        {loadingMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-red-200 p-8 text-center text-red-600 dark:border-red-900/50 dark:text-red-300">
        {errorMessage}: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-[var(--prosis-muted)]">
        {emptyMessage}
      </div>
    );
  }

  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#d9e7f6]">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column.header}-${index}`}
                className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#244b7d] ${
                  index === 0 ? "rounded-tl-lg" : ""
                } ${!hasActions && index === columns.length - 1 ? "rounded-tr-lg" : ""} ${
                  column.headerClassName ?? ""
                }`}
              >
                {column.header}
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
          {data.map((item) => (
            <tr key={getRowKey(item)} className="hover:bg-gray-50">
              {columns.map((column, index) => (
                <td
                  key={`${column.header}-${index}`}
                  className={`whitespace-nowrap px-6 py-4 text-sm ${
                    index === 0 ? "font-semibold text-gray-900" : "text-gray-500"
                  } ${column.className ?? ""}`}
                >
                  {column.cell(item)}
                </td>
              ))}
              {hasActions && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <TableActionButton variant="edit" onClick={() => onEdit(item)} />
                    )}
                    {onDelete && (
                      <TableActionButton
                        variant="delete"
                        onClick={() => onDelete(item)}
                      />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
