"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Clock3, Eye, EyeOff, Headphones, LogIn, ShieldCheck, TicketCheck } from "lucide-react";
import { getSessionUserRole } from "@/utils/roles";

type LoginAccessType = "USUARIO" | "APRENDIZ" | "EDUCADOR" | "EMPRESA";

const LOGIN_ACCESS_OPTIONS: {
  value: LoginAccessType;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "USUARIO", label: "Usuário" },
  { value: "APRENDIZ", label: "Aprendiz" },
  { value: "EDUCADOR", label: "Educador" },
  { value: "EMPRESA", label: "Empresa" },
];

const CHAMADOS_ALLOWED_ROLES = new Set(["A", "P", "T", "DEV"]);
const CHAMADOS_TECHNICAL_ROLES = new Set(["T", "DEV"]);

function getDefaultRedirect(user: { UsuCodigo?: string; UsuTipo?: string | null }) {
  if (user.UsuTipo === "APRENDIZ") {
    return `/aprendizes/cadaprendizes?id=${user.UsuCodigo}`;
  }
  if (user.UsuTipo === "EDUCADOR") return "/educador/perfil";
  if (user.UsuTipo === "EMPRESA") return "/empresa/perfil";
  return "/home";
}

function getChamadosRedirect(user: Record<string, unknown>) {
  const role = getSessionUserRole(user);
  return CHAMADOS_TECHNICAL_ROLES.has(role)
    ? "/chamados/admin/dashboard"
    : "/chamados/portal";
}

export default function LoginPage() {
  const [UsuCodigo, setUsuCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoAcesso, setTipoAcesso] = useState<LoginAccessType>("USUARIO");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [chamadoLogin, setChamadoLogin] = useState("");
  const [chamadoSenha, setChamadoSenha] = useState("");
  const [chamadoLoading, setChamadoLoading] = useState(false);
  const [chamadoError, setChamadoError] = useState("");
  const [showChamadoSenha, setShowChamadoSenha] = useState(false);
  const identifierPlaceholder = tipoAcesso === "APRENDIZ"
    ? "Código ou CPF do Aprendiz"
    : tipoAcesso === "EDUCADOR"
      ? "Código ou CPF do Educador"
      : tipoAcesso === "EMPRESA"
        ? "Código ou CNPJ da Empresa"
        : "Código do Usuário";
  const selectedAccessLabel =
    LOGIN_ACCESS_OPTIONS.find((option) => option.value === tipoAcesso)?.label ?? "acesso";

  function handleAccessTypeChange(nextAccessType: LoginAccessType) {
    setTipoAcesso(nextAccessType);
    setUsuCodigo("");
    setSenha("");
    setNeedsPassword(false);
    setLoginError(false);
    setLoginErrorMessage("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setLoginError(false);
    setLoginErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsuCodigo, senha, tipoAcesso }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "NEEDS_PASSWORD") {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }
        console.error("[Login] Motivo:", data?.message);
        setLoginError(true);
        setLoginErrorMessage(data?.message || "Credenciais inválidas. Verifique seu usuário e senha.");
        setLoading(false);
        return;
      }
      const { user } = data;
      localStorage.setItem("projov_user", JSON.stringify(user));
      window.location.href = getDefaultRedirect(user);
    } catch (error: unknown) {
      console.error("[Login] Erro inesperado:", error);
      setLoginError(true);
      setLoginErrorMessage("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }
  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setCreateError("");
    setLoading(true);
    if (newPassword.length < 6) {
      setCreateError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setCreateError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      const createRes = await fetch("/api/proxy/primeiro-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsuCodigo, senha: newPassword, tipoAcesso }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setCreateError(createData?.message || "Erro ao criar senha.");
        setLoading(false);
        return;
      }
      toast.success("Senha criada com sucesso! Você já pode entrar.");
      setNeedsPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsuCodigo, senha: newPassword, tipoAcesso }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setCreateError(loginData?.message || "Erro ao entrar.");
        setLoading(false);
        return;
      }
      const { user } = loginData;
      localStorage.setItem("projov_user", JSON.stringify(user));
      window.location.href = getDefaultRedirect(user);
    } catch (error: unknown) {
      console.error("[PrimeiroAcesso] Erro inesperado:", error);
      setCreateError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }
  async function handleChamadoLogin(e: React.FormEvent) {
    e.preventDefault();
    if (chamadoLoading) return;
    setChamadoLoading(true);
    setChamadoError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UsuCodigo: chamadoLogin,
          senha: chamadoSenha,
          tipoAcesso: "USUARIO",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setChamadoError(data?.message || "Credenciais invalidas para chamados.");
        setChamadoLoading(false);
        return;
      }

      const { user } = data;
      const role = getSessionUserRole(user);

      if (!CHAMADOS_ALLOWED_ROLES.has(role)) {
        localStorage.removeItem("projov_user");
        await fetch("/api/auth/logout", { method: "POST" });
        setChamadoError("Seu perfil nao possui acesso ao modulo de chamados.");
        setChamadoLoading(false);
        return;
      }

      localStorage.setItem("projov_user", JSON.stringify(user));
      window.location.href = getChamadosRedirect(user);
    } catch (error: unknown) {
      console.error("[ChamadosLogin] Erro inesperado:", error);
      setChamadoError("Erro inesperado. Tente novamente.");
      setChamadoLoading(false);
    }
  }
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setForgotError("");
    setLoading(true);
    const email = forgotEmail.trim();
    if (!email) {
      setForgotError("Por favor, informe seu e-mail.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/proxy/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tipoAcesso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data?.message || "Erro ao solicitar recuperação de senha.");
        return;
      }
      toast.success(data.message || "Um e-mail para troca da senha será enviado para você.");
      setForgotPasswordMode(false);
      setForgotEmail("");
    } catch {
      setForgotError("Erro ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  }
  if (needsPassword) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#253442]">
        <form
          onSubmit={handleCreatePassword}
          className="flex flex-col p-8 bg-[#34495E] shadow-2xl w-110 rounded-2xl gap-8 shadow-grey-900"
        >
          <div>
            <h1 className="text-2xl font-bold text-center text-[#FFFF]">
              Primeiro Acesso
            </h1>
            <p className="flex text-center justify-center text-[#FFFF] mt-2">
              Olá, {tipoAcesso === "EDUCADOR" ? "Educador" : tipoAcesso === "EMPRESA" ? "Empresa Parceira" : "Aprendiz"}! Crie sua nova senha para acessar o sistema.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Nova Senha (Mínimo 6 caracteres)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setCreateError("");
                }}
                className={`w-full p-3 pr-11 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
                  createError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#34495E] focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a Nova Senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setCreateError("");
                }}
                className={`w-full p-3 pr-11 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
                  createError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#34495E] focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {createError && (
              <div className="text-red-500 text-sm text-center rounded">
                {createError}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded cursor-pointer transition-[background-position] duration-500 ease-in-out
      ${
        loading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-linear-to-t from-[#345ce2] via-[#6a8dff] to-[#345ce2] bg-size-[100%_200%] bg-bottom hover:bg-top"
      }`}
          >
            {loading ? "Processando..." : "Confirmar Senha"}
          </button>
          <button
            type="button"
            onClick={() => {
              setNeedsPassword(false);
              setLoading(false);
            }}
            className="flex justify-center text-gray-300 hover:text-white mt-[-10px]"
          >
            Voltar ao Login
          </button>
        </form>
      </div>
    );
  }
  if (forgotPasswordMode) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#253442]">
        <form
          onSubmit={handleForgotPassword}
          className="flex flex-col p-8 bg-[#34495E] shadow-2xl w-110 rounded-2xl gap-8 shadow-grey-900"
        >
          <div>
            <h1 className="text-2xl font-bold text-center text-[#FFFF]">
              Recuperar Senha
            </h1>
            <p className="flex text-center justify-center text-[#FFFF] mt-2">
              Informe o e-mail cadastrado para {selectedAccessLabel} e receba as instruções de recuperação.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Seu E-mail"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError("");
                }}
                className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
                  forgotError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#34495E] focus:border-blue-500"
                }`}
              />
            </div>
            {forgotError && (
              <div className="text-red-500 text-sm text-center rounded">
                {forgotError}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded cursor-pointer transition-[background-position] duration-500 ease-in-out
      ${
        loading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-linear-to-t from-[#345ce2] via-[#6a8dff] to-[#345ce2] bg-size-[100%_200%] bg-bottom hover:bg-top"
      }`}
          >
            {loading ? "Processando..." : "Enviar E-mail"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotPasswordMode(false);
              setLoading(false);
            }}
            className="flex justify-center text-gray-300 hover:text-white mt-[-10px]"
          >
            Voltar ao Login
          </button>
        </form>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-[#0b1220] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative flex min-h-[44vh] items-center justify-center overflow-hidden bg-[#214875] px-6 py-10 sm:px-10 lg:min-h-screen">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(#061322_1px,transparent_1px),linear-gradient(90deg,#061322_1px,transparent_1px)] [background-size:44px_44px]"
          />
          <form
            onSubmit={handleChamadoLogin}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-sm sm:p-8"
          >
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <Headphones size={30} strokeWidth={2.1} />
            </div>

            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-100">
                Central de suporte
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white">
                Abertura de chamados
              </h1>
              <p className="hidden">
                Um portal interno para registrar solicitações, acompanhar o dia de abertura e organizar a fila técnica sem depender do WhatsApp.
              </p>
            </div>

            <div className="hidden">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <TicketCheck className="mb-3 text-cyan-100" size={24} />
                <p className="text-sm font-semibold text-white">Registro direto</p>
                <p className="mt-1 text-xs leading-5 text-blue-100">Chamado com usuário, data e descrição.</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <Clock3 className="mb-3 text-amber-100" size={24} />
                <p className="text-sm font-semibold text-white">Fila por dia</p>
                <p className="mt-1 text-xs leading-5 text-blue-100">Visualização diária para triagem do TI.</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <ShieldCheck className="mb-3 text-emerald-100" size={24} />
                <p className="text-sm font-semibold text-white">Acesso interno</p>
                <p className="mt-1 text-xs leading-5 text-blue-100">Entrada por credenciais de usuário ativo.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-blue-50">
                  Login
                </span>
                <input
                  type="text"
                  placeholder="Codigo do usuario"
                  value={chamadoLogin}
                  disabled={chamadoLoading}
                  onChange={(e) => {
                    setChamadoLogin(e.target.value);
                    setChamadoError("");
                  }}
                  className={`w-full rounded-xl border bg-white/95 p-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                    chamadoError
                      ? "border-red-300 focus:border-red-200"
                      : "border-white/20 focus:border-cyan-100"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-blue-50">
                  Senha
                </span>
                <div className="relative">
                  <input
                    type={showChamadoSenha ? "text" : "password"}
                    placeholder="Sua senha"
                    value={chamadoSenha}
                    disabled={chamadoLoading}
                    onChange={(e) => {
                      setChamadoSenha(e.target.value);
                      setChamadoError("");
                    }}
                    className={`w-full rounded-xl border bg-white/95 p-3 pr-11 text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                      chamadoError
                        ? "border-red-300 focus:border-red-200"
                        : "border-white/20 focus:border-cyan-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowChamadoSenha((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-800"
                    tabIndex={-1}
                  >
                    {showChamadoSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              {chamadoError && (
                <div className="rounded-lg border border-red-200/60 bg-red-950/35 px-3 py-2 text-center text-sm text-red-100">
                  {chamadoError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={chamadoLoading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl p-3 font-semibold transition-colors ${
                chamadoLoading
                  ? "cursor-not-allowed bg-white/70 text-[#214875]"
                  : "bg-white text-[#214875] hover:bg-cyan-50"
              }`}
            >
              <TicketCheck size={18} />
              {chamadoLoading ? "Entrando..." : "Entrar em chamados"}
            </button>
          </form>
        </section>

        <section className="flex min-h-[56vh] items-center justify-center px-6 py-10 sm:px-10 lg:min-h-screen">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121c2e] p-7 shadow-2xl sm:p-8"
          >
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#8ab4ff]">
                ProSis
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Bem-vindo de volta
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Gestão do Programa Jovem Aprendiz
              </p>
            </div>

            <div
              aria-label="Tipo de acesso"
              className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-700 bg-[#0b1220] p-1"
            >
              {LOGIN_ACCESS_OPTIONS.map((option) => {
                const selected = tipoAcesso === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={loading || option.disabled}
                    onClick={() => handleAccessTypeChange(option.value)}
                    className={`h-10 rounded-lg px-3 text-sm font-semibold transition-colors ${
                      selected
                        ? "bg-[#8ab4ff] text-[#07111f]"
                        : option.disabled
                          ? "cursor-not-allowed bg-[#121c2e] text-slate-500"
                          : "bg-transparent text-slate-300 hover:bg-[#1a2a42] hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Identificação
                </span>
                <input
                  type="text"
                  placeholder={identifierPlaceholder}
                  value={UsuCodigo}
                  disabled={loading}
                  onKeyDown={(e) => { if (loading) e.preventDefault(); }}
                  onChange={(e) => {
                    setUsuCodigo(e.target.value);
                    setLoginError(false);
                    setLoginErrorMessage("");
                  }}
                  className={`w-full rounded-xl border bg-[#101b2d] p-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 ${
                    loading
                      ? "cursor-not-allowed border-slate-700 opacity-60"
                      : loginError
                        ? "border-red-400 focus:border-red-300"
                        : "border-slate-700 focus:border-[#8ab4ff]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Senha
                </span>
                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    disabled={loading}
                    onKeyDown={(e) => { if (loading) e.preventDefault(); }}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setLoginError(false);
                      setLoginErrorMessage("");
                    }}
                    className={`w-full rounded-xl border bg-[#101b2d] p-3 pr-11 text-slate-100 outline-none transition-all placeholder:text-slate-500 ${
                      loading
                        ? "cursor-not-allowed border-slate-700 opacity-60"
                        : loginError
                          ? "border-red-400 focus:border-red-300"
                          : "border-slate-700 focus:border-[#8ab4ff]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    tabIndex={-1}
                  >
                    {showSenha ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              {loginError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-center text-sm text-red-200">
                  {loginErrorMessage || "Credenciais inválidas. Verifique seu usuário e senha."}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl p-3 font-semibold text-white transition-colors ${
                loading
                  ? "cursor-not-allowed bg-[#2d5d98]"
                  : "cursor-pointer bg-[#244b7d] hover:bg-[#2d5d98]"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotPasswordMode(true);
                setLoginError(false);
                setLoginErrorMessage("");
                setForgotError("");
                setForgotEmail("");
                setUsuCodigo("");
                setSenha("");
              }}
              className="mt-5 flex w-full justify-center text-sm font-medium text-slate-300 transition-colors hover:text-[#8ab4ff]"
              id="lostpassword"
            >
              Esqueci minha senha
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
