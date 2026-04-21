"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import {
  Users,
  Palmtree,
  Briefcase,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

interface DashboardStats {
  total: number;
  vacation: number;
  working: number;
  available: number;
}


export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    vacation: 0,
    working: 0,
    available: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/ca-aprendiz/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Aprendizes Ativos",
      value: stats.total,
      icon: <Users size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=active",
      description: "Jovens com situação ativa",
    },
    {
      title: "Férias / Maternidade",
      value: stats.vacation,
      icon: <Palmtree size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=vacation",
      description: "Ativos em período de férias",
    },
    {
      title: "Trabalhando",
      value: stats.working,
      icon: <Briefcase size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=working",
      description: "Ativos vinculados a empresas",
    },
    {
      title: "Disponíveis",
      value: stats.available,
      icon: <UserPlus size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=available",
      description: "Ativos aguardando contratação",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50/50 p-3">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => router.push(card.link)}
            className={`group relative overflow-hidden rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 ${card.color} ${card.shadow} shadow-2xl`}
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                  {card.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <ArrowUpRight size={20} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">
                  {card.title}
                </span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black text-white tracking-tighter">
                    {loading ? "..." : card.value}
                  </h2>
                </div>
                <p className="text-white/60 text-xs mt-4 font-medium italic">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
