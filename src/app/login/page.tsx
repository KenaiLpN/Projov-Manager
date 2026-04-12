"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
export default function LoginPage() {
  const [UsuCodigo, setUsuCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setLoginError(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsuCodigo, senha }),
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
    } catch (error: any) {
      console.error("[Login] Erro inesperado:", error);
      setLoginError(true);
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
        body: JSON.stringify({ UsuCodigo, senha: newPassword }),
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
    } catch (error: any) {
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
    } catch (error: any) {
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
            <div>
              <input
                type="password"
                placeholder="Nova Senha (Mínimo 6 caracteres)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setCreateError("");
                }}
                className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
                  createError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#34495E] focus:border-blue-500"
                }`}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirme a Nova Senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setCreateError("");
                }}
                className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
                  createError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#34495E] focus:border-blue-500"
                }`}
              />
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
        <div>
          <input
            type="text"
            placeholder="Código do Usuário, CPF ou Matrícula"
            value={UsuCodigo}
            disabled={loading}
            onKeyDown={(e) => { if (loading) e.preventDefault(); }}
            onChange={(e) => {
              setUsuCodigo(e.target.value);
              setLoginError(false);
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
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            disabled={loading}
            onKeyDown={(e) => { if (loading) e.preventDefault(); }}
            onChange={(e) => {
              setSenha(e.target.value);
              setLoginError(false);
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
        {loginError && (
          <div className="text-red-500 text-sm text-center rounded">
            Credenciais inválidas. Verifique seu usuário e senha.
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
        <button
          type="button"
          onClick={() => {
            setForgotPasswordMode(true);
            setLoginError(false);
            setUsuCodigo("");
            setSenha("");
          }}
          className="flex justify-center transition-all text-[#FFFF] hover:text-blue-500"
          id="lostpassword"
        >
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
}
