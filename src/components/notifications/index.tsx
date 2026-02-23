"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, UserPlus, Clock } from "lucide-react";
import Link from "next/link";
import api from "@/services/api";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "cadastro" | "info";
}

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchRecentRegistrations = async () => {
    setLoading(true);
    try {
      // Buscando aprendizes recentes como exemplo de "cadastros"
      const response = await api.get("/aprendiz?limit=5");
      const list = response.data.data || [];

      const formatted: Notification[] = list.map((item: any) => ({
        id: item.IdAluno,
        title: "Novo Aprendiz",
        description: `Cadastro de ${item.NomeJovem}`,
        time: item.DataUltimaInteracao || new Date().toISOString(),
        type: "cadastro",
      }));

      setNotifications(formatted);
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
      // Fallback com mock se a API falhar ou não retornar dados
      setNotifications([
        {
          id: "1",
          title: "Novo Aprendiz",
          description: "Cadastro de João Silva realizado",
          time: new Date().toISOString(),
          type: "cadastro",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentRegistrations();
    }
  }, [isOpen]);

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[#253341a4] transition-colors duration-200 outline-none focus:ring-2 focus:ring-gray-500/10 text-white"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#34495E]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Notificações
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              RECENTES
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs italic">Buscando cadastros...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-200 transition-colors">
                        <UserPlus size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                          <Clock size={10} />
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(notif.time))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 italic">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs text-gray-400">
                  Nenhuma notificação recente
                </p>
              </div>
            )}
          </div>

          <Link
            href="/aprendizes"
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 text-xs font-bold text-blue-600 hover:bg-gray-50 bg-gray-50/50 border-t border-gray-100 transition-colors"
          >
            Ver todos os cadastros
          </Link>
        </div>
      )}
    </div>
  );
}
