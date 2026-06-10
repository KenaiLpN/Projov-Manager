import { ParceiroSidebar } from "@/components/parceirosidebar";

export function ParceiroPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full bg-gray-100">
      <ParceiroSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
