"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Eye,
  EyeOff,
  Headphones,
  LogIn,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { getSessionUserRole } from "@/utils/roles";
import styles from "./login.module.css";

type LoginAccessType = "USUARIO" | "APRENDIZ" | "EDUCADOR" | "EMPRESA";
type LoginPortal = "prosis" | "chamados";
type PortalTransitionPhase = "covering" | "uncovering" | null;

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
  const [activePortal, setActivePortal] = useState<LoginPortal>("prosis");
  const [transitionTarget, setTransitionTarget] = useState<LoginPortal | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<PortalTransitionPhase>(null);
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

  const isChamadosPortal = activePortal === "chamados";

  function beginPortalTransition(target: LoginPortal) {
    if (target === activePortal || transitionPhase) return;
    setTransitionTarget(target);
    setTransitionPhase("covering");
  }

  function handlePortalTransitionEnd() {
    if (transitionPhase === "covering" && transitionTarget) {
      setActivePortal(transitionTarget);
      setTransitionPhase("uncovering");
      return;
    }

    if (transitionPhase === "uncovering") {
      setTransitionPhase(null);
      setTransitionTarget(null);
    }
  }

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
                className={`w-full p-3 rounded-xl -[#F3F4F6] border-2 outline-none ${
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
    <main
      className={`relative min-h-[100svh] overflow-hidden text-slate-100 transition-colors duration-500 ${
        isChamadosPortal ? "bg-[#715a08]" : "bg-[#08111f]"
      }`}
    >
      <button
        type="button"
        aria-label={isChamadosPortal ? "Voltar ao login do ProSis" : "Abrir login de chamados"}
        title={isChamadosPortal ? "Voltar ao ProSis" : "Acessar chamados"}
        disabled={Boolean(transitionPhase)}
        onClick={() => beginPortalTransition(isChamadosPortal ? "prosis" : "chamados")}
        className="group absolute inset-y-0 left-0 z-40 flex w-6 cursor-pointer items-stretch disabled:cursor-wait"
      >
        <span
          className={`block h-full w-2 shadow-[3px_0_18px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:w-3 ${
            isChamadosPortal ? "bg-[#214875]" : "bg-[#f7c41f]"
          }`}
        />
      </button>

      <div className="grid min-h-[100svh] lg:grid-cols-2">
        <section
          className={`relative flex min-h-[38svh] items-center overflow-hidden px-10 py-16 transition-colors duration-500 sm:px-16 lg:min-h-[100svh] lg:px-[clamp(4rem,8vw,9rem)] ${
            isChamadosPortal ? "bg-[#f7c41f] text-[#172033]" : "bg-[#78a7ef] text-white"
          }`}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-500 ${
              isChamadosPortal ? styles.supportTexture : styles.prosisTexture
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute -left-24 top-[15%] h-72 w-72 rounded-full border ${
              isChamadosPortal ? "border-[#172033]/10" : "border-white/15"
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute bottom-[8%] right-[8%] h-44 w-44 rounded-full border ${
              isChamadosPortal ? "border-[#172033]/10" : "border-white/15"
            }`}
          />

          <div className="relative z-10 max-w-2xl">
            {isChamadosPortal ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#172033]/15 bg-[#172033]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                  <Headphones size={16} />
                  Central de suporte
                </div>
                <h1 className="mt-7 max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                  Seu pedido de ajuda, acompanhado do início ao fim.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#273044]/80 sm:text-lg">
                  Registre solicitações de forma simples, acompanhe o atendimento e mantenha cada etapa organizada em um só lugar.
                </p>
                <div className="mt-10 hidden grid-cols-3 gap-3 sm:grid">
                  <div className="rounded-2xl border border-[#172033]/15 bg-white/20 p-4 backdrop-blur-sm">
                    <TicketCheck size={21} />
                    <p className="mt-3 text-sm font-bold">Registro rápido</p>
                  </div>
                  <div className="rounded-2xl border border-[#172033]/15 bg-white/20 p-4 backdrop-blur-sm">
                    <Clock3 size={21} />
                    <p className="mt-3 text-sm font-bold">Acompanhamento</p>
                  </div>
                  <div className="rounded-2xl border border-[#172033]/15 bg-white/20 p-4 backdrop-blur-sm">
                    <ShieldCheck size={21} />
                    <p className="mt-3 text-sm font-bold">Acesso interno</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                  <Sparkles size={16} />
                  Gestão integrada
                </div>
                <h1 className="mt-7 max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                  Conectando pessoas, oportunidades e resultados.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-blue-50/90 sm:text-lg">
                  O ProSis reúne a gestão do Programa Jovem Aprendiz em uma experiência segura, organizada e feita para cada perfil.
                </p>
                <div className="mt-10 hidden grid-cols-3 gap-3 sm:grid">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <UsersRound size={21} />
                    <p className="mt-3 text-sm font-bold">Acesso por perfil</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <ShieldCheck size={21} />
                    <p className="mt-3 text-sm font-bold">Ambiente seguro</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <Sparkles size={21} />
                    <p className="mt-3 text-sm font-bold">Gestão simples</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section
          className={`relative flex min-h-[62svh] items-center justify-center px-6 pb-16 pt-28 transition-colors duration-500 sm:px-10 lg:min-h-[100svh] lg:py-20 ${
            isChamadosPortal ? "bg-[#ffffff]" : "bg-[#08111F]"
          }`}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-500 ${
              isChamadosPortal ? styles.supportRightGlow : styles.prosisRightGlow
            }`}
          />

          <button
            type="button"
            disabled={Boolean(transitionPhase)}
            onClick={() => beginPortalTransition(isChamadosPortal ? "prosis" : "chamados")}
            className={`group absolute right-5 top-5 z-20 inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-bold shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:right-8 sm:top-8 ${
              isChamadosPortal
                ? "border-[#9fc0f4]/55 bg-[#214875]/45 text-blue-50 hover:border-[#b7d0f8] hover:bg-[#214875]/70"
                : "border-[#f7c41f]/70 bg-[#f7c41f]/8 text-[#f9d85e] hover:border-[#f7c41f] hover:bg-[#f7c41f]/15"
            }`}
          >
            {isChamadosPortal ? <ArrowLeft size={17} /> : <TicketCheck size={17} />}
            <span>{isChamadosPortal ? "Voltar ao ProSis" : "Acessar chamados"}</span>
            {!isChamadosPortal && (
              <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            )}
          </button>

          {isChamadosPortal ? (
            <form
              onSubmit={handleChamadoLogin}
              className="relative z-10 w-full max-w-md rounded-[1.75rem] bg-[#ffffff00] p-7  sm:p-9"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f7c41f] bg-[#f7c41f]/80 text-[#000000] shadow-inner">
                <Headphones size={28} strokeWidth={2.1} />
              </div>


              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#000000]">
                  Central de suporte
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#000000]">Abertura de chamados</h2>
                <p className="mt-2 text-sm text-slate-400">Entre para registrar ou acompanhar uma solicitação.</p>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Código do usuário
                  </span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Código do usuário"
                    value={chamadoLogin}
                    disabled={chamadoLoading}
                    onChange={(e) => {
                      setChamadoLogin(e.target.value);
                      setChamadoError("");
                    }}
                    className={`${styles.supportInput} w-full py-2.5 text-base placeholder:text-slate-400 ${
                      chamadoError ? styles.supportInputError : ""
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Senha
                  </span>
                  <div className="relative">
                    <input
                      type={showChamadoSenha ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      value={chamadoSenha}
                      disabled={chamadoLoading}
                      onChange={(e) => {
                        setChamadoSenha(e.target.value);
                        setChamadoError("");
                      }}
                      className={`${styles.supportInput} w-full py-2.5 pr-10 text-base placeholder:text-slate-400 ${
                        chamadoError ? styles.supportInputError : ""
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showChamadoSenha ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowChamadoSenha((value) => !value)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-800"
                    >
                      {showChamadoSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>

                {chamadoError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/45 px-3 py-2.5 text-center text-sm text-red-200">
                    {chamadoError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={chamadoLoading}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl p-3 font-bold transition-all duration-300 ${
                  chamadoLoading
                    ? "cursor-not-allowed bg-[#d8b33a] text-[#2d2508] opacity-70"
                    : "bg-[#f7c41f] text-[#1d1909] shadow-[0_10px_28px_rgba(247,196,31,.2)] hover:-translate-y-0.5 hover:bg-[#ffd54b]"
                }`}
              >
                <TicketCheck size={18} />
                {chamadoLoading ? "Entrando..." : "Entrar em chamados"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleLogin}
              className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-slate-700/70 bg-[#111c2e]/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-9"
            >
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8ab4ff]">ProSis</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Bem-vindo de volta</h2>
                <p className="mt-2 text-sm text-slate-400">Gestão do Programa Jovem Aprendiz</p>
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
                      className={`h-10 rounded-lg px-3 text-sm font-semibold transition-all duration-200 ${
                        selected
                          ? "bg-[#8ab4ff] text-[#07111f] shadow-sm"
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
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Identificação</span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder={identifierPlaceholder}
                    value={UsuCodigo}
                    disabled={loading}
                    onKeyDown={(e) => { if (loading) e.preventDefault(); }}
                    onChange={(e) => {
                      setUsuCodigo(e.target.value);
                      setLoginError(false);
                      setLoginErrorMessage("");
                    }}
                    className={`${styles.prosisInput} w-full rounded-xl border p-3 outline-none transition-all placeholder:text-slate-500 ${
                      loading
                        ? "cursor-not-allowed border-slate-700 opacity-60"
                        : loginError
                          ? "border-red-400 focus:border-red-300"
                          : "border-slate-700 focus:border-[#8ab4ff]"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Senha</span>
                  <div className="relative">
                    <input
                      type={showSenha ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      value={senha}
                      disabled={loading}
                      onKeyDown={(e) => { if (loading) e.preventDefault(); }}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        setLoginError(false);
                        setLoginErrorMessage("");
                      }}
                      className={`${styles.prosisInput} w-full rounded-xl border p-3 pr-11 outline-none transition-all placeholder:text-slate-500 ${
                        loading
                          ? "cursor-not-allowed border-slate-700 opacity-60"
                          : loginError
                            ? "border-red-400 focus:border-red-300"
                            : "border-slate-700 focus:border-[#8ab4ff]"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowSenha((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    >
                      {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>

                {loginError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2.5 text-center text-sm text-red-200">
                    {loginErrorMessage || "Credenciais inválidas. Verifique seu usuário e senha."}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl p-3 font-bold text-white transition-all duration-300 ${
                  loading
                    ? "cursor-not-allowed bg-[#2d5d98] opacity-70"
                    : "cursor-pointer bg-[#244b7d] shadow-[0_10px_28px_rgba(36,75,125,0.28)] hover:-translate-y-0.5 hover:bg-[#3267a7]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
          )}
        </section>
      </div>

      <div
        aria-hidden="true"
        onTransitionEnd={handlePortalTransitionEnd}
        className={`${styles.portalWipe} ${
          transitionPhase === "covering"
            ? `${styles.portalWipeActive} ${styles.portalWipeCovering}`
            : transitionPhase === "uncovering"
              ? `${styles.portalWipeActive} ${styles.portalWipeUncovering}`
              : ""
        }`}
        style={{
          backgroundColor:
            transitionTarget === "chamados" || (!transitionTarget && !isChamadosPortal)
              ? "#f7c41f"
              : "#214875",
          transformOrigin: transitionPhase === "uncovering" ? "right center" : "left center",
        }}
      />
    </main>
  );
}
