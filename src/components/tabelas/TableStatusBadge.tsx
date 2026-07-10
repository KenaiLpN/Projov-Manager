interface TableStatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function TableStatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: TableStatusBadgeProps) {
  return (
    <span className="prosis-table-status" data-status={active ? "active" : "inactive"}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
