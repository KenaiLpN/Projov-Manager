import React from "react";

export interface RegistroGI {
  GICodigo: number;
  GIRazaoSocial?: string;
  GINomeFantasia?: string;
  GICNPJ?: string;
  GICidade?: string;
  GIUF?: string;
  GITelefone?: string;
  GIEmail?: string;
}

interface TabelaProps {
  dados: RegistroGI[];
  loading: boolean;
  error: string | null;
  onEdit: (item: RegistroGI) => void;
  onDelete: (id: number) => void;
}

const TabelaRegistroGI: React.FC<TabelaProps> = ({
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
        Nenhum registro GI cadastrado.
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Razão Social / Nome Fantasia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              CNPJ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              E-mail
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr
              key={item.GICodigo}
              className="hover:bg-gray-50 transition-colors text-sm"
            >
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {item.GICodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                <div className="flex flex-col">
                  <span className="font-semibold">{item.GIRazaoSocial || "-"}</span>
                  <span className="text-xs text-gray-400 italic">
                    {item.GINomeFantasia}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.GICNPJ || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.GICidade && item.GIUF
                  ? `${item.GICidade}/${item.GIUF}`
                  : item.GICidade || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.GITelefone || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.GIEmail || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.GICodigo)}
                  className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
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

export default TabelaRegistroGI;
