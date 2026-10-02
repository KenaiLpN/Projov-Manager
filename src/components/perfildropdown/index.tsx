"use client";

import { useState, useRef, useEffect, useLayoutEffect, useId, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { User, Settings, ChevronDown, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BotaoSair } from "../LogoutButton";
import styles from "./userMenu.module.css";
import { useInterfacePreferences } from "@/hooks/useInterfacePreferences";

function getInitials(fullName: string) {
  const names = fullName.trim().split(/\s+/).filter(Boolean);
  if (!names.length) return "U";
  return `${names[0][0]}${names.length > 1 ? names[names.length - 1][0] : ""}`.toUpperCase();
}

interface UserMenuProps {
  nome: string;
  role: string;
  variant?: "header" | "sidebar";
  collapsed?: boolean;
  profileHref?: string;
  showSettings?: boolean;
}

export function UserMenu({ nome, role, variant = "header", collapsed = false, profileHref = "/perfil", showSettings = true }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, updatePreferences } = useInterfacePreferences();
  const [position, setPosition] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const menuId = useId();
  const isSidebar = variant === "sidebar";
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, collapsed]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(272, window.innerWidth - 24);
      const left = Math.max(12, Math.min(isSidebar ? rect.left : rect.right - width, window.innerWidth - width - 12));
      setPosition({
        left,
        width,
        ...(isSidebar
          ? { bottom: window.innerHeight - rect.top + 8, maxHeight: Math.max(120, rect.top - 20) }
          : { top: rect.bottom + 8, maxHeight: Math.max(120, window.innerHeight - rect.bottom - 20) }),
      });
    }
    function isInside(target: EventTarget | null) {
      return target instanceof Node && (rootRef.current?.contains(target) || menuRef.current?.contains(target));
    }
    function handleOutside(event: PointerEvent) {
      if (!isInside(event.target)) setIsOpen(false);
    }
    function handleFocusOutside(event: FocusEvent) {
      if (!isInside(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    updatePosition();
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("focusin", handleFocusOutside);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("focusin", handleFocusOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, isSidebar]);

  function handleThemeToggle() {
    updatePreferences({ theme: isDark ? "light" : "dark" });
  }

  return (
    <div className={`${styles.root} ${isSidebar ? styles.sidebar : styles.header}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`${styles.trigger} ${collapsed ? styles.collapsed : ""}`}
        aria-label={`Opções da conta de ${nome || "usuário"}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        title={collapsed ? `${nome} · ${role}` : undefined}
      >
        <span className={styles.avatar} aria-hidden="true">{getInitials(nome)}</span>
        {!collapsed && (
          <>
            <span className={styles.identity}>
              <span className={styles.name}>{nome || "Usuário"}</span>
              <span className={styles.role}>{role}</span>
            </span>
            <ChevronDown size={16} aria-hidden="true" className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} />
          </>
        )}
      </button>
      {isOpen && createPortal(
        <div ref={menuRef} id={menuId} role="region" aria-label="Opções da conta" data-prosis-account-menu="" className={styles.popover} style={position}>
          <div className={styles.popoverIdentity}>
            <span className={styles.name}>{nome || "Usuário"}</span>
            <span className={styles.role}>{role}</span>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={handleThemeToggle} className={styles.action} aria-pressed={isDark}>
              {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              <span>Modo escuro</span>
              <span className={`${styles.switch} ${isDark ? styles.switchActive : ""}`} aria-hidden="true"><span className={`theme-toggle-thumb ${styles.switchThumb}`} /></span>
            </button>
            {profileHref && (
              <Link href={profileHref} onClick={() => setIsOpen(false)} className={styles.action}><User size={17} aria-hidden="true" /> Meu perfil</Link>
            )}
            {showSettings && (
              <Link href="/configuracoes" onClick={() => setIsOpen(false)} className={styles.action}><Settings size={17} aria-hidden="true" /> Configurações</Link>
            )}
          </div>
          <div className={styles.logout}><BotaoSair /></div>
        </div>, document.body,
      )}
    </div>
  );
}
