import React from "react";
import { OcorrenciaTipo } from "@/services/ocorrenciaTipoService";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
interface TabelaOcorrenciaTipoProps {
  dados: OcorrenciaTipo[];
  loading: boolean;
  onEdit: (item: OcorrenciaTipo) => void;
  onDelete: (id: number) => void;
}
const TabelaOcorrenciaTipo: React.FC<TabelaOcorrenciaTipoProps> = ({
  dados,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-[#133c86]">
        Carregando tipos de ocorrência...
      </div>
    );
  }
  if (!dados || dados.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum tipo de ocorrência cadastrado.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider"
            >
              Código
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider"
            >
              Descrição
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider"
            >
              Tipo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-[#133c86] uppercase tracking-wider"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr key={item.OcoCodigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.OcoCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.OcoDescricao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.OcoTipo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Editar"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(item.OcoCodigo)}
                  className="text-red-600 hover:text-red-900"
                  title="Excluir"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TabelaOcorrenciaTipo;