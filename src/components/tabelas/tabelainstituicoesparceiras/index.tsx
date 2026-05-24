import React from "react";
export interface InstituicaoParceira {
  IpaCodigo: number;
  IpaDescricao: string | null;
  IpaEndereco: string | null;
  IpaNumeroEndereco: string | null;
  IpaComplemento: string | null;
  IpaBairro: string | null;
  IpaCidade: string | null;
  IpaEstado: string | null;
  IpaCEP: string | null;
  IpaEmail: string | null;
  IpaTelefone: string | null;
  IpaCelular: string | null;
  IpaSenha?: string | null;
  IpaNomeContato: string | null;
  IpaDataCadastro: string | null;
}
interface TabelaProps {
  dados: InstituicaoParceira[];
  loading: boolean;
  error: string | null;
  onEdit: (item: InstituicaoParceira) => void;
  onDelete: (id: number) => void;
}
const TabelaInstituicoesParceiras: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="text-center p-8 text-[#133c86]">Carregando...</div>;
  }
  if (error) {
    return (
      <div className="text-red-600 p-8 text-center border-t border-red-200">
        ❌ Erro: {error}
      </div>
    );
  }
  if (!dados || dados.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma instituição parceira cadastrada.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              ID
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
          {dados.map((item) => (
            <tr key={item.IpaCodigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.IpaCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.IpaDescricao || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.IpaEndereco}, {item.IpaNumeroEndereco}, {item.IpaComplemento}, {item.IpaBairro || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.IpaCidade} / {item.IpaEstado}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.IpaCodigo)}
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
export default TabelaInstituicoesParceiras;
