"use client";
import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import UserDropDown from "@/components/userdropdown";

import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter(); // F04
  const [UsuCodigo, setUsuCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [UsuTipo, setUsuTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

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

      const { user } = response.data;

      localStorage.setItem("projov_user", JSON.stringify(user));

      // F01 / F07: removido document.cookie = ...
      // O backend já nos enviou o cookie `token` como httpOnly.

      // F04: Navegação sem reload usando Next Router
      if (user.UsuTipo === "APRENDIZ") {
        router.push(`/aprendizes/cadaprendizes?id=${user.UsuCodigo}`);
      } else {
        router.push("/home");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Erro desconhecido";
      console.error("[Login 401] Motivo:", msg, error);
      setLoginError(true);
      setLoading(false);
    }
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
          <UserDropDown selectedRole={UsuTipo} onRoleChange={setUsuTipo} />
        </div>

        <div>
          <input
            type="text"
            placeholder="Código do Usuário"
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
            Credenciais inválidas. Verifique seu e-mail e senha.
          </div>
        )}

        <button
          type="submit"
          disabled={loading} // Desabilita o botão enquanto carrega
          className={`w-full text-white p-3 rounded cursor-pointer transition-[background-position] duration-500 ease-in-out
    ${
      loading
        ? "bg-blue-400 cursor-not-allowed" // Estilo quando carregando
        : "bg-linear-to-t from-[#345ce2] via-[#6a8dff] to-[#345ce2] bg-size-[100%_200%] bg-bottom hover:bg-top" // Estilo normal com animação
    }`}
        >
          {loading ? "Entrando..." : "Entrar"} {/* Muda o texto */}
        </button>
        <button
          type="button"
          className="flex justify-center text-[#FFFF] hover:text-blue-500"
          id="lostpassword"
        >
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
}
