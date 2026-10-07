"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserCog } from "lucide-react";
import { toast } from "react-hot-toast";
import { accessProfileService } from "@/services/accessProfileService";
import { useAccessPermissions } from "@/components/AccessPermissionsProvider";

type User = {
  UsuCodigo: string;
  UsuNome: string | null;
  UsuEmail: string | null;
  UsuTipo: string | null;
  chk_ativo: boolean;
  AccessProfile?: { id: number; code: string; name: string; active: boolean } | null;
};

type AssignableProfile = { id: number; code: string; name: string; active: boolean };

function errorMessage(error: unknown) {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Não foi possível atualizar o perfil.";
}

export default function DesignarPerfisPage() {
  const { can } = useAccessPermissions();
  const canEdit = can("acessos.designacoes", "edit");
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<AssignableProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userResponse, profileResponse] = await Promise.all([
        accessProfileService.assignableUsers({ page, limit: 20, search: search || undefined }),
        accessProfileService.assignableProfiles(),
      ]);
      setUsers(userResponse.data);
      setTotalPages(Number(userResponse.meta.totalPages) || 1);
      setProfiles(profileResponse.filter((profile) => profile.active));
    } catch {
      toast.error("Não foi possível carregar usuários e perfis.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void load(); }, [load]);

  async function assign(user: User, profileId: number) {
    setUpdating(user.UsuCodigo);
    try {
      await accessProfileService.assign(user.UsuCodigo, profileId);
      const profile = profiles.find((entry) => entry.id === profileId);
      setUsers((current) => current.map((entry) => entry.UsuCodigo === user.UsuCodigo
        ? { ...entry, AccessProfile: profile ? { id: profile.id, code: profile.code, name: profile.name, active: profile.active } : null }
        : entry));
      toast.success("Perfil designado com sucesso.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <main className="min-h-full bg-[var(--prosis-bg)] p-4 text-[var(--prosis-text)] md:p-8">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] shadow-sm">
        <header className="flex flex-col gap-5 border-b border-[var(--prosis-border)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--prosis-surface-soft)] text-[var(--prosis-brand)]"><UserCog size={28} /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--prosis-brand)]">Configurações</p><h1 className="mt-1 text-2xl font-semibold text-[var(--prosis-text)]">Designar Perfis</h1><p className="mt-1 text-[var(--prosis-muted)]">Associe cada usuário interno a um perfil de acesso.</p></div>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); void load(); }} className="relative w-full md:max-w-sm"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prosis-muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, e-mail ou código" className="w-full rounded-xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] py-2.5 pl-10 pr-4 text-[var(--prosis-text)] outline-none placeholder:text-[var(--prosis-muted)] focus:border-[var(--prosis-focus)] focus:ring-2 focus:ring-blue-500/20" /></form>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-[var(--prosis-surface-soft)] text-xs uppercase tracking-wide text-[var(--prosis-muted)]"><tr><th className="px-6 py-4">Usuário</th><th className="px-6 py-4">E-mail</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Perfil de acesso</th></tr></thead>
            <tbody className="divide-y divide-[var(--prosis-table-divider)]">{loading ? <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--prosis-muted)]">Carregando...</td></tr> : users.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--prosis-muted)]">Nenhum usuário encontrado.</td></tr> : users.map((user) => <tr key={user.UsuCodigo} className="hover:bg-[var(--prosis-surface-soft)]"><td className="px-6 py-4"><div className="font-semibold text-[var(--prosis-text)]">{user.UsuNome || "Sem nome"}</div><div className="text-xs text-[var(--prosis-muted)]">{user.UsuCodigo} · função anterior {user.UsuTipo || "não definida"}</div></td><td className="px-6 py-4 text-sm text-[var(--prosis-text)]">{user.UsuEmail || "—"}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.chk_ativo ? "bg-[var(--prosis-success-soft)] text-[var(--prosis-success)]" : "bg-[var(--prosis-surface-soft)] text-[var(--prosis-muted)]"}`}>{user.chk_ativo ? "Ativo" : "Inativo"}</span></td><td className="px-6 py-4"><select aria-label={`Perfil de ${user.UsuNome || user.UsuCodigo}`} disabled={!canEdit || updating === user.UsuCodigo} value={user.AccessProfile?.id ?? ""} onChange={(event) => void assign(user, Number(event.target.value))} className="w-full min-w-56 rounded-xl border border-[var(--prosis-border)] bg-[var(--prosis-surface)] px-3 py-2 text-[var(--prosis-text)] disabled:cursor-not-allowed disabled:opacity-60"><option value="" disabled>Usando função anterior</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></td></tr>)}</tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-[var(--prosis-border)] p-5"><span className="text-sm text-[var(--prosis-muted)]">Página {page} de {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-[var(--prosis-border)] px-4 py-2 text-[var(--prosis-text)] hover:bg-[var(--prosis-surface-soft)] disabled:opacity-40">Anterior</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[var(--prosis-border)] px-4 py-2 text-[var(--prosis-text)] hover:bg-[var(--prosis-surface-soft)] disabled:opacity-40">Próxima</button></div></footer>
      </section>
    </main>
  );
}
