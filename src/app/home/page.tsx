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
  Plus,
  ExternalLink,
} from "lucide-react";

interface DashboardStats {
  total: number;
  vacation: number;
  working: number;
  available: number;
}

interface Vaga {
  ReqId: number;
  ReqEmpresa: number;
  ReqDataSolita__o: string;
  ReqQuantidade: number;
  ReqAreaAtuacao: number;
  ReqSituacao?: string;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    vacation: 0,
    working: 0,
    available: 0,
  });
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVagas, setLoadingVagas] = useState(true);

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
    
    async function fetchVagasData() {
      setLoadingVagas(true);
      try {
        const [vagaRes, empRes, areaRes] = await Promise.all([
          api.get("/vagas?limit=20"), // Increased limit to take advantage of scrollbar
          api.get("/parceiros"),
          api.get("/areas")
        ]);
        
        setVagas(Array.isArray(vagaRes.data) ? vagaRes.data : vagaRes.data.data || []);
        setEmpresas(Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []);
        setAreas(Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados de vagas:", error);
      } finally {
        setLoadingVagas(false);
      }
    }

    fetchStats();
    fetchVagasData();
  }, []);

  const getEmpresaNome = (id: number) => {
    const empresa = empresas.find(e => e.ParCodigo === id);
    return empresa ? empresa.ParDescricao : "Não encontrada";
  };

  const getAreaNome = (id: number) => {
    const area = areas.find(a => a.AreaCodigo === id);
    return area ? area.AreaDescricao : "Não encontrada";
  };

  const formatData = (dataStr: string) => {
    if (!dataStr) return "-";
    try {
      const date = new Date(dataStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  const cards = [
    {
      title: "Aprendizes Cadastrados",
      value: stats.total,
      icon: <Users size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes",
      description: "Total de jovens no sistema",
    },
    {
      title: "Férias / Maternidade",
      value: stats.vacation,
      icon: <Palmtree size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=vacation",
      description: "Afastados temporariamente",
    },
    {
      title: "Trabalhando",
      value: stats.working,
      icon: <Briefcase size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=working",
      description: "Vinculados a empresas",
    },
    {
      title: "Disponíveis",
      value: stats.available,
      icon: <UserPlus size={24} />,
      color: "bg-gradient-to-br from-[#133c86] to-[#133C86]",
      shadow: "shadow-blue-700/20",
      link: "/aprendizes?filter=available",
      description: "Aguardando contratação",
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

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evolução Mensal - Now showing Vagas */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-[480px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Últimas Vagas Cadastradas</h3>
                <p className="text-xs text-gray-400 font-medium">Acompanhamento de requisições recentes</p>
              </div>
            </div>
            <button 
              onClick={() => router.push("/vagas")}
              className="flex items-center gap-2 text-xs font-bold text-[#133c86] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Ver Todas <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grow overflow-y-auto pr-2 custom-scrollbar">
            {loadingVagas ? (
              <div className="h-full flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-2 border-blue-100 border-t-[#133c86] rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm animate-pulse">Carregando...</p>
              </div>
            ) : vagas.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Empresa</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Área</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qtd</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right pr-2">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vagas.map((vaga) => (
                    <tr key={vaga.ReqId} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <span className="text-sm font-bold text-gray-700 block max-w-[200px] truncate">
                          {getEmpresaNome(vaga.ReqEmpresa)}
                        </span>
                        <span className="text-[10px] text-gray-400">#{vaga.ReqId}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {getAreaNome(vaga.ReqAreaAtuacao)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-black text-[#133c86]">{vaga.ReqQuantidade}</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <span className="text-xs font-bold text-gray-400">{formatData(vaga.ReqDataSolita__o)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-200">
                  <Briefcase size={32} />
                </div>
                <p className="text-gray-400 text-sm font-medium">Nenhuma vaga encontrada</p>
                <button 
                  onClick={() => router.push("/vagas")}
                  className="mt-3 text-[#133c86] text-xs font-bold hover:underline"
                >
                  Cadastrar agora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-[#133c86] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden text-white shadow-xl shadow-blue-900/20 group h-[480px]">
          <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
              <Plus size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              Próximos Passos
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-[200px]">
              Continue o acompanhamento dos jovens para garantir a excelência no
              programa de aprendizagem.
            </p>
          </div>
          <div className="space-y-3 relative z-10">
            <button 
              onClick={() => router.push("/vagas")}
              className="w-full bg-white text-[#133c86] font-extrabold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95 text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
            >
              Nova Vaga <Plus size={16} />
            </button>
            <button 
              onClick={() => router.push("/aprendizes")}
              className="w-full bg-blue-400/20 text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-blue-400/30 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10"
            >
              Listar Jovens <ExternalLink size={16} />
            </button>
          </div>
        </div>
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
