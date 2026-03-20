import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
export function BotaoSair() {
  const router = useRouter();
  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    try {
      await api.post("/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao sair", error);
      window.location.href = "/login";
    }
  }
  return (
    <div className="flex items-center justify-center py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 cursor-pointer">
      <button
        type="button"
        onClick={handleLogout}
        className="text-red-600 mr-3 rounded-xl items-center justify-center cursor-pointer flex"
      >
        <LogOut /> Sair
      </button>
    </div>
  );
}