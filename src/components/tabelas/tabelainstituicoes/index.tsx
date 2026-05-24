import React from "react";
export interface Instituicao {
  EscCodigo: number;
  EscNome: string | null;
  EscEmail: string | null;
  EscTelefone: string | null;
  EscCEP: string | null;
  EscEndereco: string | null;
  EscNumeroEndereco: string | null;
  EscBairro: string | null;
  EscCidade: string | null;
  EscEstado: string | null;
  EscComplemento: string | null;
  EscDiretor: string | null;
}
interface TabelaInstituicoesProps {
  instituicoes: Instituicao[];
  loading: boolean;
  error: string | null;
  onEdit: (instituicao: Instituicao) => void;
  onDelete: (id: number) => void;
}
const TabelaInstituicoes: React.FC<TabelaInstituicoesProps> = ({
  instituicoes,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-[#133c86]">
        Carregando instituições...
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
  if (!instituicoes || instituicoes.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma instituição cadastrada.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Instituição Parceira
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Endereço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {instituicoes.map((inst) => (
            <tr key={inst.EscCodigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {inst.EscCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {inst.EscNome || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {inst.EscEndereco}, {inst.EscNumeroEndereco || "-"}, {inst.EscBairro || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {inst.EscCidade} / {inst.EscEstado}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(inst)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(inst.EscCodigo)}
                  className="text-red-600 hover:text-red-900 cursor-pointer"
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
export default TabelaInstituicoes;
