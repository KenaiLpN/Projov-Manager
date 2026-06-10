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
  {
    name: "Cadastros",
    href: "#",
    subMenu: [
      { name: "Cadastro de Cursos", href: "/pedagogico/cursos" },
      { name: "Cadastro de Disciplinas", href: "/pedagogico/disciplinas" },
      { name: "Cadastro de Turmas", href: "/pedagogico/turmas" },
      { name: "Cadastro de Conceitos", href: "/pedagogico/conceitos" },
      { name: "Áreas de Atuação", href: "/pedagogico/areas" },
    ],
  },
  {
    name: "Lista Jovens Carga Horária",
    href: "/pedagogico/lista-jovens",
  },
  { name: "Lista de Monitores/Funcionário", href: "/pedagogico/monitores" },
  { name: "Módulos de Aprendizagem", href: "/pedagogico/modulos" },
  { name: "Planos Curriculares", href: "/pedagogico/planos" },
  {
    name: "Lista de Presença",
    href: "#",
    subMenu: [
      { name: "Lista de Presença", href: "/pedagogico/presenca" },
      { name: "Lista Presença Capacitação", href: "/pedagogico/presenca-capacitacao" },
      { name: "Lista Presença Introdutório", href: "/pedagogico/presenca-introdutorio" },
    ],
  },
  {
    name: "Cronogramas",
    href: "#",
    subMenu: [
      { name: "Cronogramas", href: "/pedagogico/cronogramas" },
      { name: "Geração de Cronograma", href: "/pedagogico/gerar-cronograma" },
      { name: "Gerar Cronograma Turma/Semestre", href: "/pedagogico/gerar-cronograma-semanal" },
    ],
  },
  {
    name: "Aprendizes/Alunos por Turma",
    href: "#",
    subMenu: [
      { name: "Aprendizes por Turma", href: "/pedagogico/aprendizes-turma" },
      { name: "Alunos por Turma", href: "/pedagogico/alunos-turma" },
    ],
  },
  {
    name: "Lançamento de Falta",
    href: "#",
    subMenu: [
      { name: "Lançar Faltas", href: "/pedagogico/faltas" },
      { name: "Lançar Faltas Capacitação", href: "/pedagogico/faltas-capacitacao" },
      { name: "Lançar Faltas Informática", href: "/pedagogico/faltas-informatica" },
    ],
  },
  {
    name: "Controle de Presença",
    href: "/pedagogico/presenca-data-turma",
  },
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

export function PedagogicoSidebar() {
  return (
    <div className="flex flex-col bg-[#0F306D] w-64 h-full overflow-y-auto overflow-x-hidden border-r border-[#123A83]/50">
      <div className="py-2">
        <SidebarGroup items={menuItems} />
      </div>
    </div>
  );
}
