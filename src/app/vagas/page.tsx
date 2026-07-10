"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  Search,
  Filter,
  RefreshCcw
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import Modal from "@/components/modal";
import VagaForm from "@/components/vagas/VagaForm";
import VagaList, { Vaga, VagaArea, VagaEmpresa } from "@/components/vagas/VagaList";
import ConfirmModal from "@/components/modal/ConfirmModal";

export default function VagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresas, setEmpresas] = useState<VagaEmpresa[]>([]);
  const [areas, setAreas] = useState<VagaArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vagaToDelete, setVagaToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vagaRes, empRes, areaRes] = await Promise.all([
        api.get("/vagas"),
        api.get("/parceiros?limit=1000"),
        api.get("/areas?limit=1000")
      ]);
      
      const vacancies = Array.isArray(vagaRes.data) ? vagaRes.data : vagaRes.data.data || [];
      setVagas(vacancies);
      setEmpresas(Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []);
      setAreas(Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar lista de vagas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vagas");
      setVagas(Array.isArray(res.data) ? res.data : res.data.data || []);
      toast.success("Lista atualizada!");
    } catch {
      toast.error("Erro ao atualizar lista.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setVagaToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vagaToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/vagas/${vagaToDelete}`);
      setVagas(prev => prev.filter(v => v.ReqId !== vagaToDelete));
      toast.success("Vaga excluída com sucesso!");
    } catch {
      toast.error("Erro ao excluir vaga.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setVagaToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    handleRefresh();
  };

  const filteredVagas = vagas.filter(vaga => {
    const empresaNome = empresas.find(e => e.ParCodigo === vaga.ReqEmpresa)?.ParDescricao || "";
    const areaNome = areas.find(a => a.AreaCodigo === vaga.ReqAreaAtuacao)?.AreaDescricao || "";
    const searchString = `${empresaNome} ${areaNome} ${vaga.ReqId}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133c86] tracking-tight flex items-center gap-3">
            <div className="bg-[#133c86] p-2 rounded-xl text-white shadow-lg shadow-blue-900/10">
              <Briefcase size={24} />
            </div>
            Gestão de Vagas
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-1 ml-12">
            Visualize e gerencie as requisições de vagas abertas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-3 bg-white text-gray-400 hover:text-[#133c86] hover:bg-blue-50 border border-gray-200 rounded-xl transition-all shadow-sm"
            title="Atualizar lista"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#133c86] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:bg-[#1a4da6] transition-all transform active:scale-95 uppercase text-xs tracking-wider"
          >
            <Plus size={18} />
            Nova Vaga
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text"
            placeholder="Buscar por empresa, área ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 text-gray-500 font-bold border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-xs uppercase tracking-wider h-full">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Vaga List Component */}
      <VagaList 
        vagas={filteredVagas}
        loading={loading}
        empresas={empresas}
        areas={areas}
        onEdit={() => {
          // Future: Load data into form for editing
          toast.success("Função de edição em breve!");
        }}
        onDelete={handleDeleteClick}
        onView={(vaga) => {
            toast.success(`Visualizando vaga #${vaga.ReqId}`);
        }}
      />

      {/* Create Vaga Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        maxWidth="max-w-7xl"
      >
        <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-6 flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-black text-[#133c86] uppercase tracking-tight flex items-center gap-2">
                <Plus size={20} />
                Nova Requisição de Vaga
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Preencha os dados abaixo</p>
            </div>
          </div>
          <VagaForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Excluir Vaga"
        message="Tem certeza que deseja excluir esta requisição de vaga? Esta ação não pode ser desfeita."
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
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
