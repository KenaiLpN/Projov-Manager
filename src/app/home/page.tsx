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
  TrendingUp,
  Activity,
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
        const response = await api.get("/aprendiz/stats");
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
      title: "Aprendizes Cadastrados",
      value: stats.total,
      icon: <Users size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133c86]",
      shadow: "shadow-gray-200",
      link: "/aprendizes",
      description: "Total de jovens no sistema",
    },
    {
      title: "Férias / Maternidade",
      value: stats.vacation,
      icon: <Palmtree size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133c86]",
      shadow: "shadow-gray-200",
      link: "/aprendizes?filter=vacation",
      description: "Afastados temporariamente",
    },
    {
      title: "Trabalhando",
      value: stats.working,
      icon: <Briefcase size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133c86]",
      shadow: "shadow-gray-200",
      link: "/aprendizes?filter=working",
      description: "Vinculados a empresas",
    },
    {
      title: "Disponíveis",
      value: stats.available,
      icon: <UserPlus size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133c86]",
      shadow: "shadow-gray-200",
      link: "/aprendizes?filter=available",
      description: "Aguardando contratação",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50/50 p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#133c86] tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            Visão panorâmica do programa de aprendizado
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => router.push(card.link)}
            className={`group relative overflow-hidden rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 ${card.color} ${card.shadow} shadow-2xl`}
          >
            {/* Background Decorative elements */}
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

      {/* Decorative Placeholder for Charts etc */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Evolução Mensal</h3>
          <p className="text-gray-400 max-w-sm mt-2">
            Módulo de análises avançadas em desenvolvimento. Em breve você
            poderá visualizar gráficos de crescimento aqui.
          </p>
        </div>

        <div className="bg-[#133c86] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden text-white shadow-xl shadow-blue-900/20">
          <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              Próximos Passos
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Continue o acompanhamento dos jovens para garantir a excelência no
              programa de aprendizagem.
            </p>
          </div>
          <button className="bg-white text-[#133c86] font-extrabold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95 text-sm uppercase tracking-widest shadow-lg">
            Ver Relatórios
          </button>
        </div>
      </div>
    </div>
  );
}
