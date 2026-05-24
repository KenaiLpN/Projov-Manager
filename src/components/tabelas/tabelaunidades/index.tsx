import React from "react";
import { Unidade } from "@/types";
interface TabelaUnidadesProps {
  unidades: Unidade[];
  loading: boolean;
  error: string | null;
  onEdit: (unidade: Unidade) => void;
  onDelete: (id: number) => void;
}
const TabelaUnidades: React.FC<TabelaUnidadesProps> = ({
  unidades,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-[#133c86]">
        Carregando unidades...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 p-8 text-center border-t border-red-200">
        ❌ Erro ao buscar: {error}
      </div>
    );
  }
  if (!unidades || unidades.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma unidade cadastrada.
      </div>
    );
  }
  function formatCPF(cpf: string) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return (
    <div className="p-4 overflow-x-auto ">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Campus
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Endereço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Bairro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {unidades.map((unidade) => (
            <tr key={unidade.UniCodigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {unidade.UniCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {unidade.UniNome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {unidade.UniEndereco}, {unidade.UniNumeroEndereco}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {unidade.UniBairro}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {unidade.UniCidade} - {unidade.UniEstado}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {unidade.UniTelefone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(unidade)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(unidade.UniCodigo)}
                  className="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TabelaUnidades;
