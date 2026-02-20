"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";

// Componentes
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import SearchBox from "@/components/searchbox";
import Pagination from "@/components/pagination";

// Nossos novos componentes
import TabelaOcorrenciaTipo from "@/components/tabelas/TabelaOcorrenciaTipo";
import OcorrenciaTipoForm from "@/components/forms/OcorrenciaTipoForm";
import { AprendizSidebar } from "@/components/aprendizsidebar";

// Serviço e Tipos
import {
  getAllOcorrenciaTipos,
  createOcorrenciaTipo,
  updateOcorrenciaTipo,
  deleteOcorrenciaTipo,
  OcorrenciaTipo,
} from "@/services/ocorrenciaTipoService";

export default function OcorrenciasPage() {
  // Estados para dados e carregamento
  const [data, setData] = useState<OcorrenciaTipo[]>([]);
  const [loading, setLoading] = useState(false);

  // Paginação e Busca
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Item sendo editado ou excluído
  const [selectedItem, setSelectedItem] = useState<OcorrenciaTipo | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Estado de envio do formulário
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAllOcorrenciaTipos(
        currentPage,
        itemsPerPage,
        search,
      );
      setData(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      toast.error("Erro ao carregar tipos de ocorrência.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]); // Recarrega quando página ou busca mudam

  // Handlers
  const handleSearch = (term: string) => {
    setSearch(term);
    setCurrentPage(1); // Volta para pagina 1 ao buscar
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: OcorrenciaTipo) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: {
    OcoDescricao: string;
    OcoTipo: string;
  }) => {
    try {
      setIsSubmitting(true);
      if (selectedItem) {
        // Update
        await updateOcorrenciaTipo(selectedItem.OcoCodigo, formData);
        toast.success("Tipo de ocorrência atualizado com sucesso!");
      } else {
        // Create
        await createOcorrenciaTipo(formData);
        toast.success("Tipo de ocorrência criado com sucesso!");
      }
      setIsFormOpen(false);
      loadData(); // Recarrega a tabela
    } catch (error) {
      toast.error("Erro ao salvar tipo de ocorrência.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteOcorrenciaTipo(itemToDelete);
      toast.success("Tipo de ocorrência excluído com sucesso!");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir tipo de ocorrência.");
      console.error(error);
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AprendizSidebar />

      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#133c86]">
            Tipos de Ocorrência
          </h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#133c86] text-white px-4 py-2 rounded-lg hover:bg-[#0c2a60] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Tipo
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Buscar por descrição..."
            initialValue={search}
          />
        </div>

        <TabelaOcorrenciaTipo
          dados={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Modal de Formulário (Criar/Editar) */}
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#133c86]">
              {selectedItem
                ? "Editar Tipo de Ocorrência"
                : "Novo Tipo de Ocorrência"}
            </h2>
          </div>
          <OcorrenciaTipoForm
            initialData={selectedItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Excluir Tipo de Ocorrência"
          message="Tem certeza que deseja excluir este tipo de ocorrência? Esta ação não pode ser desfeita."
        />
      </main>
    </div>
  );
}
