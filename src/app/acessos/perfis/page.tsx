"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Pencil, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { accessProfileService, type AccessProfile, type PermissionCatalogItem } from "@/services/accessProfileService";
import type { EffectivePermission } from "@/utils/accessPermissions";
import { useAccessPermissions } from "@/components/AccessPermissionsProvider";

type EditorState = {
  id: number | null;
  version?: number;
  name: string;
  parentId: number | null;
  isCoordinator: boolean;
  active: boolean;
  permissions: Record<string, { canView: boolean; canEdit: boolean }>;
};

const emptyEditor = (): EditorState => ({
  id: null,
  name: "",
  parentId: null,
  isCoordinator: false,
  active: true,
  permissions: {},
});

function messageFromError(error: unknown, fallback: string) {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate.response?.data?.message ?? fallback;
}

function PermissionSummary({ keys, labels }: { keys: string[]; labels: Map<string, string> }) {
  if (keys.length === 0) return <span className="text-[var(--prosis-muted)]">Nenhuma</span>;
  const visible = keys.slice(0, 2).map((key) => labels.get(key) ?? key);
  return <span title={keys.map((key) => labels.get(key) ?? key).join(" | ")}>{visible.join(" | ")}{keys.length > 2 ? ` +${keys.length - 2}` : ""}</span>;
}

export default function PerfisPermissoesPage() {
  const { can, refresh: refreshOwnPermissions } = useAccessPermissions();
  const canEdit = can("acessos.perfis", "edit");
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogData, profileData] = await Promise.all([
        accessProfileService.catalog(),
        accessProfileService.list({ limit: 100, search: search || undefined }),
      ]);
      setCatalog(catalogData.sort((a, b) => a.order - b.order));
      setProfiles(profileData.data);
    } catch (error) {
      toast.error(messageFromError(error, "Não foi possível carregar os perfis."));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  const labels = useMemo(() => new Map(catalog.map((permission) => [permission.key, permission.label])), [catalog]);
  const sections = useMemo(() => {
    const result = new Map<string, PermissionCatalogItem[]>();
    for (const permission of catalog) result.set(permission.section, [...(result.get(permission.section) ?? []), permission]);
    return [...result.entries()];
  }, [catalog]);

  function openCreate() {
    setEditor(emptyEditor());
  }

  function openEdit(profile: AccessProfile) {
    setEditor({
      id: profile.id,
      version: profile.version,
      name: profile.name,
      parentId: profile.parentId,
      isCoordinator: profile.isCoordinator,
      active: profile.active,
      permissions: Object.fromEntries(profile.permissions.map((permission) => [permission.key, {
        canView: permission.canView,
        canEdit: permission.canEdit,
      }])),
    });
  }

  function setPermission(key: string, field: "canView" | "canEdit", checked: boolean) {
    setEditor((current) => {
      if (!current) return current;
      const previous = current.permissions[key] ?? { canView: false, canEdit: false };
      const next = field === "canEdit"
        ? { canView: checked ? true : previous.canView, canEdit: checked }
        : { canView: checked, canEdit: checked ? previous.canEdit : false };
      return { ...current, permissions: { ...current.permissions, [key]: next } };
    });
  }

  function setSection(section: string, field: "canView" | "canEdit", checked: boolean) {
    const entries = catalog.filter((permission) => permission.section === section && (field === "canView" || permission.editable));
    setEditor((current) => {
      if (!current) return current;
      const permissions = { ...current.permissions };
      for (const permission of entries) {
        const previous = permissions[permission.key] ?? { canView: false, canEdit: false };
        permissions[permission.key] = field === "canEdit"
          ? { canView: checked ? true : previous.canView, canEdit: checked }
          : { canView: checked, canEdit: checked ? previous.canEdit : false };
      }
      return { ...current, permissions };
    });
  }

  async function save() {
    if (!editor?.name.trim()) {
      toast.error("Informe o nome do perfil.");
      return;
    }
    setSaving(true);
    const permissions: EffectivePermission[] = catalog.map(({ key }) => ({
      key,
      canView: editor.permissions[key]?.canView ?? false,
      canEdit: editor.permissions[key]?.canEdit ?? false,
    })).filter(({ canView, canEdit }) => canView || canEdit);
    const payload = {
      name: editor.name.trim(), parentId: editor.parentId,
      isCoordinator: editor.isCoordinator, active: editor.active,
      expectedVersion: editor.version, permissions,
    };
    try {
      if (editor.id) await accessProfileService.update(editor.id, payload);
      else await accessProfileService.create(payload);
      toast.success(editor.id ? "Perfil atualizado." : "Perfil criado.");
      setEditor(null);
      await Promise.all([load(), refreshOwnPermissions()]);
    } catch (error) {
      toast.error(messageFromError(error, "Não foi possível salvar o perfil."));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(profile: AccessProfile) {
    if (!window.confirm(`Desativar o perfil “${profile.name}”?`)) return;
    try {
      await accessProfileService.deactivate(profile.id);
      toast.success("Perfil desativado.");
      await load();
    } catch (error) {
      toast.error(messageFromError(error, "Não foi possível desativar o perfil."));
    }
  }

  return (
    <main className="min-h-full bg-[var(--prosis-bg)] p-4 text-[var(--prosis-text)] md:p-8">
      <section className="mx-auto max-w-[1500px] overflow-hidden rounded-3xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] shadow-sm">
        <header className="flex flex-col gap-5 border-b border-[var(--prosis-border)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--prosis-surface-soft)] text-[var(--prosis-brand)]"><ShieldCheck size={28} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--prosis-brand)]">Configurações</p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--prosis-text)]">Perfis e Permissões</h1>
              <p className="mt-1 text-[var(--prosis-muted)]">Defina o que cada perfil pode visualizar e editar.</p>
            </div>
          </div>
          {canEdit && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"><Plus size={18} />Cadastrar novo perfil</button>}
        </header>

        <div className="flex flex-col gap-3 border-b border-[var(--prosis-border)] p-5 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prosis-muted)]" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar perfil" className="w-full rounded-xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] py-2.5 pl-10 pr-4 text-[var(--prosis-text)] outline-none placeholder:text-[var(--prosis-muted)] focus:border-[var(--prosis-focus)] focus:ring-2 focus:ring-blue-500/20" />
          </label>
          <span className="text-sm text-[var(--prosis-muted)]">{profiles.length} {profiles.length === 1 ? "perfil" : "perfis"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead className="bg-[var(--prosis-surface-soft)] text-xs uppercase tracking-wide text-[var(--prosis-muted)]">
              <tr><th className="px-5 py-4">ID</th><th className="px-5 py-4">Nome do perfil</th><th className="px-5 py-4">Hierarquia</th><th className="px-5 py-4">Coordenação</th><th className="px-5 py-4">Visualização</th><th className="px-5 py-4">Edição</th><th className="px-5 py-4 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-[var(--prosis-table-divider)]">
              {loading ? <tr><td colSpan={7} className="px-5 py-12 text-center text-[var(--prosis-muted)]">Carregando perfis...</td></tr> : profiles.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-[var(--prosis-muted)]">Nenhum perfil encontrado.</td></tr> : profiles.map((profile) => (
                <tr key={profile.id} className={!profile.active ? "bg-[var(--prosis-surface-soft)] opacity-70" : "hover:bg-[var(--prosis-surface-soft)]"}>
                  <td className="px-5 py-4 text-sm text-[var(--prosis-muted)]">{profile.id}</td>
                  <td className="px-5 py-4"><div className="font-semibold text-[var(--prosis-text)]">{profile.name}</div><div className="mt-1 text-xs text-[var(--prosis-muted)]">{profile.isSystem ? "Perfil do sistema" : profile.active ? "Personalizado" : "Inativo"} · {profile.userCount} usuário(s)</div></td>
                  <td className="px-5 py-4 text-sm text-[var(--prosis-text)]">{profile.parent?.name ?? "Raiz"}</td>
                  <td className="px-5 py-4 text-sm text-[var(--prosis-text)]">{profile.isCoordinator ? "Sim" : "Não"}</td>
                  <td className="max-w-xs px-5 py-4 text-sm text-[var(--prosis-text)]"><PermissionSummary keys={profile.visualizacao} labels={labels} /></td>
                  <td className="max-w-xs px-5 py-4 text-sm text-[var(--prosis-text)]"><PermissionSummary keys={profile.edicao} labels={labels} /></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">{canEdit && <button type="button" onClick={() => openEdit(profile)} aria-label={`Editar ${profile.name}`} className="rounded-lg border border-[var(--prosis-border)] p-2 text-[var(--prosis-brand)] hover:bg-[var(--prosis-surface-soft)]"><Pencil size={17} /></button>}{canEdit && !profile.isSystem && <button type="button" onClick={() => void deactivate(profile)} aria-label={`Desativar ${profile.name}`} className="rounded-lg border border-[var(--prosis-border)] p-2 text-[var(--prosis-danger)] hover:bg-[var(--prosis-danger-soft)]"><Trash2 size={17} /></button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editor && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
        <section className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-[var(--prosis-surface)] text-[var(--prosis-text)] shadow-2xl">
          <header className="flex items-start justify-between border-b border-[var(--prosis-border)] p-5 md:p-7">
            <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--prosis-brand)]">Fluxo rápido</p><h2 id="profile-editor-title" className="mt-1 text-2xl font-semibold text-[var(--prosis-text)]">{editor.id ? "Editar perfil" : "Cadastrar novo perfil"}</h2><p className="mt-1 text-[var(--prosis-muted)]">Escolha o nome, a hierarquia e as permissões do perfil.</p></div>
            <button type="button" onClick={() => setEditor(null)} className="rounded-xl bg-[var(--prosis-danger-soft)] p-3 text-[var(--prosis-danger)] hover:brightness-110" aria-label="Fechar"><X size={20} /></button>
          </header>
          <div className="overflow-y-auto p-5 md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--prosis-muted)]">Nome do perfil</span><input autoFocus value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} maxLength={100} className="w-full rounded-xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] px-4 py-3 text-[var(--prosis-text)] outline-none focus:border-[var(--prosis-focus)] focus:ring-2 focus:ring-blue-500/20" /></label>
              <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--prosis-muted)]">Perfil pai</span><select value={editor.parentId ?? ""} onChange={(event) => setEditor({ ...editor, parentId: event.target.value ? Number(event.target.value) : null })} className="w-full rounded-xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] px-4 py-3 text-[var(--prosis-text)]"><option value="">Nenhum perfil raiz</option>{profiles.filter((profile) => profile.active && profile.id !== editor.id).map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
              <div className="flex items-center gap-6 rounded-xl border border-[var(--prosis-border)] px-4 py-3"><label className="flex items-center gap-3"><input type="checkbox" checked={editor.isCoordinator} onChange={(event) => setEditor({ ...editor, isCoordinator: event.target.checked })} className="h-5 w-5 accent-blue-600" /><span>Perfil coordenador</span></label><label className="flex items-center gap-3"><input type="checkbox" checked={editor.active} onChange={(event) => setEditor({ ...editor, active: event.target.checked })} className="h-5 w-5 accent-blue-600" /><span>Ativo</span></label></div>
            </div>

            <div className="mt-6 space-y-4">{sections.map(([section, entries]) => {
              const allView = entries.every(({ key }) => editor.permissions[key]?.canView);
              const editableEntries = entries.filter(({ editable }) => editable);
              const allEdit = editableEntries.length > 0 && editableEntries.every(({ key }) => editor.permissions[key]?.canEdit);
              return <details key={section} open className="overflow-hidden rounded-2xl border border-[var(--prosis-border)]">
                <summary className="flex cursor-pointer list-none items-center justify-between bg-[var(--prosis-surface-soft)] px-5 py-4"><span className="flex items-center gap-2 font-semibold text-[var(--prosis-text)]"><ChevronDown size={18} />{section}</span><span className="flex flex-wrap items-center gap-4 text-sm font-normal"><label className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={allView} onChange={(event) => setSection(section, "canView", event.target.checked)} className="h-4 w-4 accent-blue-600" />Visualizar todos</label>{editableEntries.length > 0 && <label className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={allEdit} onChange={(event) => setSection(section, "canEdit", event.target.checked)} className="h-4 w-4 accent-blue-600" />Editar todos</label>}</span></summary>
                <div className="grid grid-cols-[1fr_90px_90px] border-t border-[var(--prosis-border)] bg-[var(--prosis-surface-soft)] px-5 py-2 text-xs font-semibold uppercase text-[var(--prosis-muted)]"><span>Submenu</span><span className="text-center">Visualizar</span><span className="text-center">Editar</span></div>
                {entries.map((permission) => <div key={permission.key} className="grid grid-cols-[1fr_90px_90px] items-center border-t border-[var(--prosis-table-divider)] px-5 py-3"><span><span className="block text-sm font-medium text-[var(--prosis-text)]">{permission.label}</span><span className="text-xs text-[var(--prosis-muted)]">{permission.group}</span></span><span className="text-center"><input aria-label={`Visualizar ${permission.label}`} type="checkbox" checked={editor.permissions[permission.key]?.canView ?? false} onChange={(event) => setPermission(permission.key, "canView", event.target.checked)} className="h-5 w-5 accent-blue-600" /></span><span className="text-center"><input aria-label={`Editar ${permission.label}`} type="checkbox" disabled={!permission.editable} checked={editor.permissions[permission.key]?.canEdit ?? false} onChange={(event) => setPermission(permission.key, "canEdit", event.target.checked)} className="h-5 w-5 accent-blue-600 disabled:opacity-25" /></span></div>)}
              </details>;
            })}</div>
          </div>
          <footer className="flex justify-end gap-3 border-t border-[var(--prosis-border)] p-5"><button type="button" onClick={() => setEditor(null)} className="rounded-xl border border-[var(--prosis-border)] px-5 py-2.5 font-medium text-[var(--prosis-text)] hover:bg-[var(--prosis-surface-soft)]">Cancelar</button><button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? "Salvando..." : "Salvar perfil"}</button></footer>
        </section>
      </div>}
    </main>
  );
}
