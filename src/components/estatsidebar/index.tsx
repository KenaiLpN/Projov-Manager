"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
interface NavItem {
  name: string;
  href: string;
}
const navItems: NavItem[] = [
  { name: "Participantes Por Situação", href: "/estatisticas/part_por_situacao" },
  { name: "Estatística Geral Aprendizes", href: "/estatisticas/geral_aprendiz"},
  { name: "Aprendizes Por Parceiro", href: "/estatisticas/aprendiz_por_parceiro" },
  { name: "Gestão De Avaliações", href: "/estatisticas/gestao_avaliacao" },
  { name: "Avaliações Disponíveis Educadores", href: "/estatisticas/avaliacoes_educadores" },
  { name: "Avaliações Disponíveis Empresa", href: "/estatisticas/avaliacoes_empresa" },
  { name: "Avaliações Realizadas", href: "/estatisticas/avaliacoes_realizadas" },
  { name: "Relatório LOG", href: "/estatisticas/relatorio_log" },
];
export function EstatSidebar() {
  const pathname = usePathname();
  const baseLinkClasses =
    "flex items-center transition font-medium duration-300 ease-in-out h-14 w-full justify-center hover:bg-[#123A83] ";
  const activeLinkClasses = "text-[#FFFF] bg-[#123A83] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive = "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#123A83]";
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };
  return (
    <div className="flex flex-col bg-[#0F306D] w-60 h-full items-center">
      {navItems.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            className={getLinkClasses(item.href)}
          >
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
