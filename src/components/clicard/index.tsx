import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TagStatus } from "../tagstatus";
type Client = {
  id: number;
  cod_cli: number;
  razao_social: string;
  fantasia: string;
  cnpj: string;
  ie: string;
  endereco: string;
  num_endereco: number;
  cidade: string;
  bairro: string;
  estado: string;
  telefone: string;
  email: string;
  nome_contato: string;
  cep: number;
  chkAtivo: string;
  createdAt: string;
  updatedAt: string;
};
interface Props {
  client: Client;
}
function formatPhone(phone?: string) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (cleaned.length === 9) {
    return cleaned.replace(/^(\d{5})(\d{4})$/, "$1-$2");
  } else if (cleaned.length === 8) {
    return cleaned.replace(/^(\d{4})(\d{4})$/, "$1-$2");
  }
  return phone;
}
function formatCNPJ(cnpj: string) {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}
export function ClientCard({ client }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] mb-5 m-7">
      <div className="m-10">
        <div className="flex justify-between">
          <div>
            <p className="text-2xl font-bold">
              {client.cod_cli} - {client.razao_social}
            </p>
            <p className="text-[#64748B]">CNPJ: {formatCNPJ(client.cnpj)}</p>
          </div>
          <div>
            <TagStatus chkAtivo={client.chkAtivo} />
          </div>
        </div>
        <div className="bg-[#F7FAFC] m-5 border rounded-xl border-[#E5E7EB]">
          <header
            className="cursor-pointer p-5 flex justify-between items-center bg-[#FFFFFF] rounded-xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="font-semibold">Dados da Empresa</span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </header>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isOpen
                ? "px-5 opacity-100 translate-y-0 max-h-[1000px]"
                : "opacity-0 -translate-y-2 pointer-events-none max-h-0 px-5"
            }`}
          >
            <div className="grid grid-cols-2 m-5">
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Razão Social</p>
                  <p className="font-medium">{client.razao_social}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">CNPJ</p>
                  <p className="font-medium">{formatCNPJ(client.cnpj)}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Endereço</p>
                  <p className="font-medium">
                    {client.endereco}, {client.num_endereco} - {client.bairro}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B]">Telefone</p>
                  <p className="font-medium">{formatPhone(client.telefone)}</p>
                </div>
              </div>
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Nome Fantasia</p>
                  <p className="font-medium">{client.fantasia}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Inscrição Estadual</p>
                  <p className="font-medium">{client.ie}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Cidade/UF</p>
                  <p className="font-medium">
                    {client.cidade}/{client.estado}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B]">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            </div>
            <hr className="text-[#E5E7EB]" />
            {}
            <div className="grid grid-cols-2 m-5">
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Razão Social</p>
                  <p className="font-medium">{client.razao_social}</p>
                </div>
              </div>
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Nome Fantasia</p>
                  <p className="font-medium">{client.fantasia}</p>
                </div>
              </div>
            </div>
            <hr className="text-[#E5E7EB]" />
            <div className="grid grid-cols-2 m-5">
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Sistema Operacional</p>
                  <p className="font-medium">Windows 10 Pro</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Memória RAM</p>
                  <p className="font-medium">16GB</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Endereço IP Local</p>
                  <p className="font-medium">192.168.0.10</p>
                </div>
              </div>
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Processador</p>
                  <p className="font-medium">Intel Core i5-10400</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Armazenamento</p>
                  <p className="font-medium">SSD 256GB</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Endereço MAC</p>
                  <p className="font-medium">00:1A:2B:3C:4D:5E</p>
                </div>
              </div>
            </div>
            <hr className="text-[#E5E7EB]" />
            <div className="grid grid-cols-2 m-5">
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Tipo de Banco</p>
                  <p className="font-medium">SQL Server</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Instância</p>
                  <p className="font-medium">Lince</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Senha</p>
                  <p className="font-medium">Tecno2017Lince</p>
                </div>
              </div>
              {}
              <div className="space-y-5">
                <div>
                  <p className="text-[#64748B]">Versão</p>
                  <p className="font-medium">2019</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Usuário</p>
                  <p className="font-medium">db_user</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Porta</p>
                  <p className="font-medium">1433</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}