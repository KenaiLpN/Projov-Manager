"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

interface MenuItem {
  name: string;
  href: string;
  subMenu?: MenuItem[];
  isBlue?: boolean;
}

const menuItems: MenuItem[] = [
  
  { name: "Participantes Por Situação", href: "/estatisticas/part_por_situacao" },
  { name: "Estatística Geral Aprendizes", href: "/estatisticas/geral_aprendiz"},
  { name: "Aprendizes Por Parceiro", href: "/estatisticas/aprendiz_por_parceiro" },
  { name: "Gestão De Avaliações", href: "/estatisticas/gestao_avaliacao" },
  { name: "Avaliações Disponíveis Educadores", href: "/estatisticas/avaliacoes_educadores" },
  { name: "Avaliações Disponíveis Empresa", href: "/estatisticas/avaliacoes_empresa" },
  { name: "Avaliações Realizadas", href: "/estatisticas/avaliacoes_realizadas" },
  { name: "Relatório LOG", href: "/estatisticas/relatorio_log" },

];

function SidebarItem({ 
  item, 
  depth = 0,
  isExpanded,
  onToggle
}: { 
  item: MenuItem, 
  depth?: number,
  isExpanded: boolean,
  onHover: () => void,
  onToggle: () => void
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasSub = item.subMenu && item.subMenu.length > 0;

  const baseClasses = "flex items-center transition font-medium duration-300 ease-in-out h-auto min-h-[3rem] w-full px-4 hover:bg-[#123A83] text-sm py-2";
  const activeClasses = "text-[#FFFF] bg-[#123A83]";
  const inactiveClasses = "text-[#F6F6F6]";
  return (
    <div className="w-full">
      <div 
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} cursor-pointer`}
        onClick={() => onToggle()}
      >
        <Link href={item.href} className="flex-1 flex items-center h-full" onClick={(e) => item.href === "#" && e.preventDefault()}>
          <span style={{ paddingLeft: `${depth * 0.75}rem` }}>{item.name}</span>
        </Link>
        {hasSub && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''} shrink-0 ml-2`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && hasSub ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {hasSub && (
          <div className="bg-[#0b2452]/30 w-full border-l-2 border-white/5">
            <SidebarGroup items={item.subMenu!} depth={depth + 1} />
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarGroup({ items, depth = 0 }: { items: MenuItem[], depth?: number }) {
  const pathname = usePathname();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Auto-expand based on current pathname
  useEffect(() => {
    const activeIndex = items.findIndex(item => {
      if (item.href === "#") {
        return item.subMenu?.some(sub => pathname.startsWith(sub.href));
      }
      return pathname.startsWith(item.href);
    });
    setExpandedIndex(activeIndex !== -1 ? activeIndex : null);
  }, [pathname, items]);

  return (
    <>
      {items.map((item, index) => (
        <SidebarItem 
          key={item.href + item.name + index} 
          item={item} 
          depth={depth}
          isExpanded={expandedIndex === index}
          onHover={() => setExpandedIndex(index)}
          onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
        />
      ))}
    </>
  );
}

export function EstatSidebar() {
  return (
    <div className="flex flex-col bg-[#0F306D] w-64 h-full overflow-y-auto overflow-x-hidden border-r border-[#123A83]/50">
      <div className="py-2">
        <SidebarGroup items={menuItems} />
      </div>
    </div>
  );
}
