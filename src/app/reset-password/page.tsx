"use client";
import { useState, Suspense } from "react";
import api from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#34495E] shadow-2xl w-110 rounded-2xl gap-8">
        <h1 className="text-2xl font-bold text-center text-red-400">
          Acesso Inválido
        </h1>
        <p className="text-center text-[#FFFF]">
          O link de recuperação está ausente ou inválido. Por favor, tente redefinir sua senha novamente a partir da página de login.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full text-white p-3 rounded bg-blue-500 hover:bg-blue-600"
        >
          Voltar ao Login
        </button>
      </div>
    );
  }
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    if (newPassword.length < 6) {
      setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.post("/reset-password", { token, newPassword });
      toast.success(response.data.message || "Senha alterada com sucesso!");
      router.push("/login");
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Erro ao tentar redefinir a senha."));
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={handleReset}
      className="flex flex-col p-8 bg-[#34495E] shadow-2xl w-110 rounded-2xl gap-8 shadow-grey-900"
    >
      <div>
        <h1 className="text-2xl font-bold text-center text-[#FFFF]">
          Nova Senha
        </h1>
        <p className="text-center text-[#FFFF] mt-2">
          Digite a sua nova senha abaixo.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Nova Senha (Mínimo 6 caracteres)"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrorMsg("");
          }}
          className="w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none border-[#34495E] focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Confirme a Nova Senha"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrorMsg("");
          }}
          className="w-full p-3 rounded-xl bg-[#F3F4F6] border-2 outline-none border-[#34495E] focus:border-blue-500"
        />
        {errorMsg && (
          <div className="text-red-500 text-sm text-center rounded">
            {errorMsg}
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
        {loading ? "Processando..." : "Salvar Nova Senha"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="flex justify-center text-gray-300 hover:text-white mt-[-10px]"
      >
        Cancelar e voltar
      </button>
    </form>
  );
}
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#253442]">
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
