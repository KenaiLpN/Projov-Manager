"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

type LoginAccessType = "USUARIO" | "APRENDIZ" | "EDUCADOR" | "EMPRESA";

const LOGIN_ACCESS_OPTIONS: {
  value: LoginAccessType;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "USUARIO", label: "Usuário" },
  { value: "APRENDIZ", label: "Aprendiz" },
  { value: "EDUCADOR", label: "Educador", disabled: true },
  { value: "EMPRESA", label: "Empresa", disabled: true },
];

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
  const identifierPlaceholder = tipoAcesso === "APRENDIZ"
    ? "Código ou CPF do Aprendiz"
    : "Código do Usuário";

  function handleAccessTypeChange(nextAccessType: LoginAccessType) {
    setTipoAcesso(nextAccessType);
    setUsuCodigo("");
    setSenha("");
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
      if (user.UsuTipo === "APRENDIZ") {
        window.location.href = `/aprendizes/cadaprendizes?id=${user.UsuCodigo}`;
      } else {
        window.location.href = "/home";
      }
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
        body: JSON.stringify({ UsuCodigo, senha: newPassword }),
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
      if (user.UsuTipo === "APRENDIZ") {
        window.location.href = `/aprendizes/cadaprendizes?id=${user.UsuCodigo}`;
      } else {
        window.location.href = "/home";
      }
    } catch (error: unknown) {
      console.error("[PrimeiroAcesso] Erro inesperado:", error);
      setCreateError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setForgotError("");
    setLoading(true);
    if (!forgotEmail) {
      setForgotError("Por favor, informe seu e-mail.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/proxy/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
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
              Olá, Aprendiz! Crie sua nova senha para acessar o sistema.
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
              Informe seu e-mail cadastrado para receber as instruções e recuperar o acesso.
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
    <div className="flex items-center justify-center h-screen bg-[#253442]">
      <form
        onSubmit={handleLogin}
        className="flex flex-col p-8 bg-[#34495E] shadow-2xl w-110 rounded-2xl gap-8 shadow-grey-900"
      >
        <div>
          <h1 className="text-2xl font-bold text-center text-[#FFFF]">
            Bem vindo ao PROSIS
          </h1>
          <p className="flex justify-center text-[#FFFF]">
            Gestão do Programa Jovem Aprendiz
          </p>
        </div>
        <div
          aria-label="Tipo de acesso"
          className="grid grid-cols-2 gap-2 rounded-xl bg-[#253442] p-1"
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
                className={`h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-[#F3F4F6] text-[#253442]"
                    : option.disabled
                      ? "cursor-not-allowed bg-[#34495E] text-slate-400"
                      : "bg-[#34495E] text-white hover:bg-[#42627d]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div>
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
            className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none transition-all ${
              loading
                ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400"
                : loginError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#34495E] focus:border-blue-500"
            }`}
          />
        </div>
        <div className="relative">
          <input
            type={showSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            disabled={loading}
            onKeyDown={(e) => { if (loading) e.preventDefault(); }}
            onChange={(e) => {
              setSenha(e.target.value);
              setLoginError(false);
              setLoginErrorMessage("");
            }}
            className={`w-full p-3 pr-11 rounded-xl bg-[#F3F4F6] border-2 outline-none transition-all ${
              loading
                ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400"
                : loginError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#34495E] focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
        {loginError && (
          <div className="text-red-500 text-sm text-center rounded">
            {loginErrorMessage || "Credenciais inválidas. Verifique seu usuário e senha."}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-3 rounded transition-all duration-300 flex items-center justify-center gap-2 font-semibold
    ${
      loading
        ? "bg-[#345ce2] cursor-not-allowed"
        : "bg-linear-to-t from-[#345ce2] via-[#6a8dff] to-[#345ce2] bg-size-[100%_200%] bg-bottom hover:bg-top cursor-pointer"
    }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            "Entrar"
          )}
        </button>
        {tipoAcesso === "USUARIO" && (
          <button
            type="button"
            onClick={() => {
              setForgotPasswordMode(true);
              setLoginError(false);
              setLoginErrorMessage("");
              setUsuCodigo("");
              setSenha("");
            }}
            className="flex justify-center transition-all text-[#FFFF] hover:text-blue-500"
            id="lostpassword"
          >
            Esqueci minha senha
          </button>
        )}
      </form>
    </div>
  );
}
