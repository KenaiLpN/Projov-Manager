"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronRight, Command, Search, X } from "lucide-react";
import { Header } from "../header";
import { UserMenu } from "../perfildropdown";
import { getRoleLabel, getSessionUserRole } from "@/utils/roles";
import { NavigationContext } from "./NavigationContext";
import { flattenNavigation, getNavigationMatch, getNavigationSections } from "./navigation";
import styles from "./navigation.module.css";
import { useInterfacePreferences } from "@/hooks/useInterfacePreferences";
import { useAccessPermissions } from "@/components/AccessPermissionsProvider";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const focusable = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]';

export default function AppNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { preferences, updatePreferences, shouldReduceMotion: reducedMotion } = useInterfacePreferences();
  const { permissions, loading: permissionsLoading } = useAccessPermissions();
  const [user, setUser] = useState({ name: "", role: "", id: "" });
  const collapsed = preferences.sidebarCollapsed;
  const [mobile, setMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const drawerTriggerRef = useRef<HTMLElement | null>(null);
  const sections = useMemo(
    () => getNavigationSections(user.role, user.id, permissionsLoading ? [] : permissions),
    [permissions, permissionsLoading, user.id, user.role],
  );
  const match = getNavigationMatch(sections, pathname);
  const selectedSection = sections.find((section) => section.id === opened);
  const compact = collapsed && !mobile;
  const overlayOpen = opened !== null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("projov_user");
      const session = raw ? JSON.parse(raw) : null;
      if (session && typeof session === "object") {
        setUser({ name: typeof session.UsuNome === "string" ? session.UsuNome : "Usuário", role: getSessionUserRole(session), id: String(session.UsuCodigo ?? "") });
      }
    } catch { /* O layout de autenticação trata um cache de sessão inválido. */ }
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => { setMobile(media.matches); setDrawerOpen(false); setOpened(null); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => { setOpened(null); setDrawerOpen(false); setQuery(""); }, [pathname]);

  const closePanel = useCallback(() => {
    setOpened(null); setQuery("");
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const closeNavigation = useCallback(() => {
    setOpened(null); setDrawerOpen(false); setQuery("");
    requestAnimationFrame(() => {
      if (mobile) drawerTriggerRef.current?.focus();
    });
  }, [mobile]);

  const openPanel = useCallback((id: string) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setOpened((current) => current === id ? null : id); setQuery("");
  }, []);

  useEffect(() => {
    if (!opened) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [opened]);

  useEffect(() => {
    if (!mobile || !drawerOpen || opened) return;
    const frame = requestAnimationFrame(() => sidebarRef.current?.querySelector<HTMLElement>("button")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [mobile, drawerOpen, opened]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        setOpened("search"); setQuery("");
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (event.key === "Escape" && !event.defaultPrevented) {
        if (document.querySelector("[data-prosis-account-menu]")) return;
        if (opened) { event.preventDefault(); closePanel(); }
        else if (drawerOpen) { event.preventDefault(); closeNavigation(); }
      }
      if (event.key === "Tab" && mobile && (drawerOpen || opened)) {
        const scope = opened ? panelRef.current : sidebarRef.current;
        const accountMenu = document.querySelector<HTMLElement>("[data-prosis-account-menu]");
        const elements = [...(scope?.querySelectorAll<HTMLElement>(focusable) ?? []), ...(accountMenu?.querySelectorAll<HTMLElement>(focusable) ?? [])]
          .filter((element) => element.getClientRects().length > 0);
        const first = elements[0]; const last = elements[elements.length - 1];
        if (!first) return;
        if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement as HTMLElement))) {
          event.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobile, opened, drawerOpen, closePanel, closeNavigation]);

  const toggleSidebar = () => {
    if (mobile) {
      drawerTriggerRef.current = document.activeElement as HTMLElement;
      setDrawerOpen((value) => !value); return;
    }
    updatePreferences({ sidebarCollapsed: !collapsed });
  };

  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const results = flattenNavigation(selectedSection ? [selectedSection] : sections).filter((item) => {
    const text = normalize(`${item.name} ${item.description ?? ""} ${item.sectionName} ${item.groupName ?? ""}`);
    return terms.every((term) => text.includes(term));
  });
  const groups = new Map<string, typeof results>();
  for (const item of results) {
    const label = selectedSection ? item.groupName || "Visão geral" : item.sectionName;
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  const breadcrumbs: { name: string; href?: string }[] = [{ name: "ProSis", href: sections[0]?.href }];
  if (match) {
    breadcrumbs.push({ name: match.section.name, href: match.section.href });
    if (match.item && match.item.name !== match.section.name) breadcrumbs.push({ name: match.item.name });
  } else breadcrumbs.push({ name: pathname === "/perfil" ? "Meu perfil" : pathname === "/configuracoes" ? "Configurações" : "Visão geral" });
  const externalRole = ["APRENDIZ", "EMPRESA", "EDUCADOR"].includes(user.role);
  const profileHref = user.role === "APRENDIZ" || user.role === "EMPRESA" ? sections[0]?.href ?? "" : user.role === "EDUCADOR" ? "" : "/perfil";
  const SelectedIcon = selectedSection?.icon ?? Command;

  return (
    <NavigationContext.Provider value={true}>
      <div className={styles.shell} data-collapsed={compact} style={{ "--sidebar-width": compact ? "76px" : "264px" } as CSSProperties}>
        <a className={styles.skipLink} href="#prosis-content">Pular para o conteúdo</a>
        <AnimatePresence>
          {mobile && drawerOpen && <motion.div className={styles.mobileBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} onClick={closeNavigation} aria-hidden="true" />}
        </AnimatePresence>
        <aside id="prosis-navigation" ref={sidebarRef} className={styles.sidebar} data-open={drawerOpen}
          aria-label="Menu de navegação" role={mobile && drawerOpen ? "dialog" : undefined}
          aria-modal={mobile && drawerOpen && !opened ? true : undefined} inert={mobile && (!drawerOpen || overlayOpen) ? true : undefined}>
          <div className={styles.brandRow}>
            <Link href={sections[0]?.href ?? "/"} className={styles.brand} onClick={closeNavigation} aria-label="ProSis — página inicial" title={compact ? "ProSis" : undefined}>
              <span className={styles.brandMark} aria-hidden="true">P<span /></span>
              {!compact && <span className={styles.brandText}>ProSis<span>JOVEM APRENDIZ</span></span>}
            </Link>
            {mobile && <button type="button" className={styles.iconButton} onClick={closeNavigation} aria-label="Fechar navegação"><X size={19} /></button>}
          </div>
          <div className={styles.searchWrap}>
            <button type="button" className={styles.searchTrigger} onClick={() => openPanel("search")} title={compact ? "Buscar no menu (Ctrl+K)" : undefined} aria-label="Buscar módulos e páginas">
              <Search size={17} aria-hidden="true" />
              {!compact && <><span>Buscar no menu...</span><kbd>Ctrl K</kbd></>}
            </button>
          </div>
          <nav className={styles.nav} aria-label="Navegação principal">
            {!compact && <p className={styles.navLabel}>ESPAÇO DE TRABALHO</p>}
            {sections.map((section) => {
              const Icon = section.icon;
              const hasMenu = section.groups.length > 0;
              const active = match?.section.id === section.id;
              const classes = `${styles.navItem} ${active ? styles.navActive : ""} ${opened === section.id ? styles.navOpened : ""}`;
              const content = <><Icon size={19} strokeWidth={1.7} aria-hidden="true" />{!compact && <><span>{section.name}</span>{hasMenu && <ChevronRight size={14} className={styles.navChevron} aria-hidden="true" />}</>}</>;
              return <div key={section.id} className={styles.navItemWrap}>
                {hasMenu
                  ? <button type="button" className={classes} onClick={() => openPanel(section.id)} aria-label={section.name} aria-expanded={opened === section.id} aria-controls={opened === section.id ? "prosis-navigation-panel" : undefined} title={compact ? section.name : undefined}>{content}</button>
                  : <Link href={section.href} className={classes} onClick={closeNavigation} aria-label={section.name} aria-current={active ? "page" : undefined} title={compact ? section.name : undefined}>{content}</Link>}
              </div>;
            })}
          </nav>
          {!compact && <div className={styles.sidebarNote}><span className={styles.noteDot} />Programa Jovem Aprendiz<span>Conectando caminhos e oportunidades.</span></div>}
          <div className={styles.account}>
            <UserMenu nome={user.name || "Minha conta"} role={getRoleLabel(user.role)} variant="sidebar" collapsed={compact} profileHref={profileHref} showSettings={!externalRole} />
          </div>
        </aside>
        <div className={styles.workspace} inert={mobile && (drawerOpen || overlayOpen) ? true : undefined}>
          <Header expanded={mobile ? drawerOpen : !collapsed} mobile={mobile} onToggle={toggleSidebar} onSearch={() => openPanel("search")} breadcrumbs={breadcrumbs} showNotifications={Boolean(user.role) && !externalRole} />
          <main id="prosis-content" tabIndex={-1} className={styles.content} inert={overlayOpen || (mobile && drawerOpen) ? true : undefined}>
            <div className={styles.page}>{children}</div>
          </main>
        </div>
        <AnimatePresence>
          {overlayOpen && <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>
            <div className={styles.backdrop} onClick={closePanel} aria-hidden="true" />
            <motion.div id="prosis-navigation-panel" ref={panelRef} role="dialog" aria-modal={mobile ? true : undefined} aria-labelledby="prosis-panel-title"
              className={styles.flyout} initial={{ opacity: 0, y: reducedMotion ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
              <div className={styles.flyoutHeading}>
                <div className={styles.flyoutTitle}>
                  <span className={styles.sectionIcon}><SelectedIcon size={23} aria-hidden="true" /></span>
                  <div><p className={styles.eyebrow}>NAVEGAÇÃO RÁPIDA</p><h2 id="prosis-panel-title">{selectedSection?.name ?? "Encontre seu próximo destino"}</h2><p>{selectedSection?.description ?? "Todos os módulos e páginas em um só lugar."}</p></div>
                </div>
                <button type="button" onClick={closePanel} className={styles.iconButton} aria-label={mobile && drawerOpen ? "Voltar ao menu" : "Fechar painel de navegação"} title="Fechar (Esc)">{mobile && drawerOpen ? <ArrowLeft size={20} /> : <X size={20} />}</button>
              </div>
              <div className={styles.flyoutSearch}>
                <Search size={18} aria-hidden="true" />
                <input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={selectedSection ? `Buscar em ${selectedSection.name.toLowerCase()}...` : "O que você está procurando?"} aria-label="Buscar páginas" />
                {query ? <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className={styles.iconButton} aria-label="Limpar busca"><X size={16} /></button> : <kbd>ESC</kbd>}
              </div>
              <div className={styles.flyoutBody}>
                {results.length > 0 ? <div className={styles.menuGrid}>
                  {[...groups].map(([label, items]) => <section key={label} className={styles.menuGroup}>
                    <h3>{label}<span>{items.length.toString().padStart(2, "0")}</span></h3>
                    {items.map((item) => <Link key={item.href} href={item.href} onClick={closeNavigation} className={`${styles.destination} ${pathname === item.href.split("?")[0] ? styles.destinationActive : ""}`} aria-current={pathname === item.href.split("?")[0] ? "page" : undefined}>
                      <span><strong>{item.name}</strong>{item.description && <small>{item.description}</small>}</span><ArrowUpRight size={15} aria-hidden="true" />
                    </Link>)}
                  </section>)}
                </div> : <div className={styles.empty}><Search size={28} /><h3>Nenhuma página encontrada</h3><p>Tente outro termo, como “aprendizes” ou “presença”.</p><button type="button" onClick={() => setQuery("")}>Limpar busca</button></div>}
              </div>
              <div className={styles.flyoutFooter}><span aria-live="polite">{results.length} {results.length === 1 ? "página disponível" : "páginas disponíveis"}</span><span><kbd>Tab</kbd> navegar <kbd>Enter</kbd> abrir</span></div>
            </motion.div>
          </motion.div>}
        </AnimatePresence>
      </div>
    </NavigationContext.Provider>
  );
}
