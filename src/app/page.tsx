import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Se houver token, redireciona para /home, senão para /login
  // Isso serve como fallback caso o middleware não capture a requisição
  if (token) {
    redirect("/home");
  } else {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}