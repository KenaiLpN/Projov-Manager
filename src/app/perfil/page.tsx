"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CalendarDays, IdCard, Mail, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import api from "@/services/api";
import { Usuario } from "@/types";
import { getRoleLabel } from "@/utils/roles";

type PerfilUsuario = Omit<Usuario, "cpf"> & {
  cpf?: string | null;
};

type ProfileState = {
  user: PerfilUsuario | null;
  loading: boolean;
  error: string | null;
};

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "U";
}

function formatDate(value?: string | null) {
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("projov_user");
    return stored ? (JSON.parse(stored) as Partial<PerfilUsuario>) : null;
  } catch {
    return null;
  }
}

function updateStoredUser(user: PerfilUsuario) {
  try {
    const previous = getStoredUser();
    localStorage.setItem(
      "projov_user",
      JSON.stringify({
        ...previous,
        ...user,
      }),
    );
  } catch {
    // O perfil continua carregado mesmo se o navegador bloquear localStorage.
  }
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {value || "Nao informado"}
      </p>
    </div>
  );
}

export default function PerfilPage() {
  const [{ user, loading, error }, setProfile] = useState<ProfileState>({
    user: null,
    loading: true,
    error: null,
  });

  const loadProfile = useCallback(async () => {
    setProfile((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.get<PerfilUsuario>("/users/me");
      updateStoredUser(response.data);
      setProfile({ user: response.data, loading: false, error: null });
    } catch {
      const cachedUser = getStoredUser();
      setProfile({
        user: cachedUser as PerfilUsuario | null,
        loading: false,
        error:
          "Nao foi possivel carregar os dados atualizados do usuario logado.",
      });
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const roleLabel = getRoleLabel(user?.UsuTipo);
  const statusLabel = loading
    ? "Carregando..."
    : user?.chk_ativo == null
      ? "Nao informado"
      : user.chk_ativo
        ? "Ativo"
        : "Inativo";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 p-6 text-slate-900 dark:bg-[#07111f] dark:text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-sm">
                {getInitials(user?.UsuNome)}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-[#52E8FB]">
                  Meu perfil
                </p>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {loading ? "Carregando..." : user?.UsuNome || "Usuario"}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Dados do cadastro de usuarios vinculados a sessao atual.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadProfile}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Atualizar
              </button>
              <Link
                href="/cadastros/usuarios"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <UserRound size={16} />
                Cadastro de usuarios
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Dados atualizados indisponiveis</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem
            icon={<IdCard size={16} />}
            label="Codigo"
            value={loading ? "Carregando..." : user?.UsuCodigo}
          />
          <InfoItem
            icon={<UserRound size={16} />}
            label="Nome"
            value={loading ? "Carregando..." : user?.UsuNome}
          />
          <InfoItem
            icon={<Mail size={16} />}
            label="E-mail"
            value={loading ? "Carregando..." : user?.UsuEmail}
          />
          <InfoItem
            icon={<ShieldCheck size={16} />}
            label="Perfil de acesso"
            value={loading ? "Carregando..." : roleLabel}
          />
          <InfoItem
            icon={<ShieldCheck size={16} />}
            label="Status"
            value={statusLabel}
          />
          <InfoItem
            icon={<CalendarDays size={16} />}
            label="Ultima atualizacao"
            value={loading ? "Carregando..." : formatDate(user?.atualizado_em)}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Informacoes da conta
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoItem
              icon={<CalendarDays size={16} />}
              label="Criado em"
              value={loading ? "Carregando..." : formatDate(user?.criado_em)}
            />
            <InfoItem
              icon={<IdCard size={16} />}
              label="ID interno"
              value={loading ? "Carregando..." : user?.id_usuario}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
