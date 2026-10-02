"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import HiddenSidebar from "@/components/hidensidebar";
import { NotificationsMenu } from "@/components/notifications";
import styles from "@/components/navigation/navigation.module.css";

interface HeaderProps {
  expanded: boolean;
  mobile: boolean;
  onToggle: () => void;
  onSearch: () => void;
  breadcrumbs: { name: string; href?: string }[];
  showNotifications: boolean;
}

export function Header({
  expanded,
  mobile,
  onToggle,
  onSearch,
  breadcrumbs,
  showNotifications,
}: HeaderProps) {
  return (
    <header className={styles.toolbar}>
      <HiddenSidebar
        expanded={expanded}
        mobile={mobile}
        onClick={onToggle}
        className={styles.iconButton}
      />
      <span className={styles.toolbarDivider} aria-hidden="true" />
      <nav className={styles.breadcrumbs} aria-label="Caminho de navegação">
        <ol>
          {breadcrumbs.map((breadcrumb, index) => {
            const isCurrent = index === breadcrumbs.length - 1;

            return (
              <li key={`${breadcrumb.name}-${index}`}>
                {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
                {isCurrent || !breadcrumb.href ? (
                  <span aria-current={isCurrent ? "page" : undefined}>
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link href={breadcrumb.href}>{breadcrumb.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className={styles.toolbarActions}>
        <span className={styles.workspaceLabel}>Gestão Jovem Aprendiz</span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onSearch}
          aria-label="Buscar no sistema"
          title="Buscar no sistema (Ctrl+K)"
        >
          <Search size={18} aria-hidden="true" />
        </button>
        {showNotifications && <NotificationsMenu variant="surface" />}
      </div>
    </header>
  );
}
