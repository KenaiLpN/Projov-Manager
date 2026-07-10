import { PencilLine, X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type TableActionButtonVariant = "edit" | "delete";

interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: TableActionButtonVariant;
}

export function TableActionButton({
  variant,
  type = "button",
  ...props
}: TableActionButtonProps) {
  const Icon = variant === "edit" ? PencilLine : X;
  const label = variant === "edit" ? "Editar" : "Excluir";

  return (
    <button
      {...props}
      type={type}
      title={props.title ?? label}
      aria-label={props["aria-label"] ?? label}
      data-variant={variant}
      className={`prosis-table-action cursor-pointer ${props.className ?? ""}`}
    >
      <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
