"use client";
import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import UserDropDown from "@/components/userdropdown";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
export default function LoginPage() {
  const router = useRouter(); 
  const [UsuCodigo, setUsuCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [UsuTipo, setUsuTipo] = useState<string | null>(null);
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
    setLoading(true);
    setLoginError(false);
    if (!UsuTipo) {
      toast.error("Selecione o tipo de perfil.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.post("/login", { UsuCodigo, senha, UsuTipo });
      const { user, token } = response.data;
      localStorage.setItem("projov_user", JSON.stringify(user));
      if (token) {
        Cookies.set("token", token, { expires: 8 / 24 });
      }
      if (user.UsuTipo === "APRENDIZ") {
        window.location.href = `/aprendizes/cadaprendizes?id=${user.UsuCodigo}`;
      } else {
        window.location.href = "/home";
      }
    } catch (error: any) {
      const code = error?.response?.data?.code;
      if (code === "NEEDS_PASSWORD") {
        setNeedsPassword(true);
        setLoading(false);
        return;
      }
      const msg = error?.response?.data?.message ?? "Erro desconhecido";
      console.error("[Login 401] Motivo:", msg, error);
      setLoginError(true);
      setLoading(false);
    }
  }
  async function handleCreatePassword(e: React.FormEvent) {
    e.preventDefault();
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
      await api.post("/primeiro-acesso", {
        UsuCodigo,
        senha: newPassword,
      });
      toast.success("Senha criada com sucesso! Você já pode entrar.");
      setNeedsPassword(false);
      setSenha(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      const response = await api.post("/login", { UsuCodigo, senha: newPassword, UsuTipo });
      const { user, token } = response.data;
      localStorage.setItem("projov_user", JSON.stringify(user));
      if (token) {
        Cookies.set("token", token, { expires: 8 / 24 });
      }
      if (user.UsuTipo === "APRENDIZ") {
        window.location.href = `/aprendizes/cadaprendizes?id=${user.UsuCodigo}`;
      } else {
        window.location.href = "/home";
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao criar senha.";
      setCreateError(msg);
      setLoading(false);
    }
  }
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    setLoading(true);
    if (!forgotEmail) {
      setForgotError("Por favor, informe seu e-mail.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.post("/forgot-password", { email: forgotEmail });
      toast.success(response.data.message || "Um e-mail para troca da senha será enviado para você.");
      setForgotPasswordMode(false);
      setForgotEmail("");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao solicitar recuperação de senha.";
      setForgotError(msg);
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
          <p className="flex justify-center text-[#FFFF]">+
            Gestão do Programa Jovem Aprendiz
          </p>
        </div>
        <div>
          <UserDropDown selectedRole={UsuTipo} onRoleChange={(val) => {
            setUsuTipo(val);
            setSenha("");
          }} />
        </div>
        <div>
          <input
            type="text"
            placeholder={UsuTipo === "APRENDIZ" ? "Seu CPF ou Matrícula" : "Código do Usuário"}
            value={UsuCodigo}
            onChange={(e) => {
              setUsuCodigo(e.target.value);
              setLoginError(false);
            }}
            className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
              loginError
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
            onChange={(e) => {
              setSenha(e.target.value);
              setLoginError(false);
            }}
            className={`w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none ${
              loginError
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
          className={`w-full text-white p-3 rounded cursor-pointer transition-[background-position] duration-500 ease-in-out
    ${
      loading
        ? "bg-blue-400 cursor-not-allowed" // Estilo quando carregando
        : "bg-linear-to-t from-[#345ce2] via-[#6a8dff] to-[#345ce2] bg-size-[100%_200%] bg-bottom hover:bg-top" // Estilo normal com animação
    }`}
        >
          {loading ? "Entrando..." : "Entrar"} {}
        </button>
        <button
          type="button"
          onClick={() => {
            setForgotPasswordMode(true);
            setLoginError(false);
            setUsuTipo(null);
            setUsuCodigo("");
            setSenha("");
          }}
          className="flex justify-center text-[#FFFF] hover:text-blue-500"
          id="lostpassword"
        >
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
}