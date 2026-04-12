import { LogOut } from "lucide-react";
export function BotaoSair() {
  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignora erro de rede — redireciona de qualquer forma
    }
    localStorage.removeItem("projov_user");
    window.location.href = "/login";
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