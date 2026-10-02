"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface HiddenSidebarProps {
  expanded: boolean;
  mobile?: boolean;
  onClick: () => void;
  className?: string;
}

export default function HiddenSidebar({
  expanded,
  mobile = false,
  onClick,
  className,
}: HiddenSidebarProps) {
  const label = mobile
    ? expanded ? "Fechar menu de navegação" : "Abrir menu de navegação"
    : expanded ? "Recolher menu lateral" : "Expandir menu lateral";
  const Icon = expanded ? PanelLeftClose : mobile ? Menu : PanelLeftOpen;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls="prosis-navigation"
      title={label}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
