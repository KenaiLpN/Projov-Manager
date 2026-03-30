"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

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
    isBlue: true,
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
      { name: "Gerar Cronograma Semanal", href: "/pedagogico/gerar-cronograma-semanal" },
      { name: "Datas encontros", href: "/pedagogico/datas-encontros" },
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
    href: "#",
    subMenu: [
      { name: "Comunicado Faltas", href: "/pedagogico/comunicado-faltas" },
      { name: "Por Data/Turma", href: "/pedagogico/presenca-data-turma" },
      { name: "Por Data/Turma Capacitação", href: "/pedagogico/presenca-data-turma-capacitacao" },
      { name: "Por Periodo/Turma", href: "/pedagogico/presenca-periodo-turma" },
      { name: "Por Periodo/Turma Capacitacao", href: "/pedagogico/presenca-periodo-turma-capacitacao" },
      { name: "Por Periodo/Parceiro", href: "/pedagogico/presenca-periodo-parceiro" },
      { name: "Total Periodo/Turma", href: "/pedagogico/total-periodo-turma" },
      { name: "Total Periodo/Turma Capacitação", href: "/pedagogico/total-periodo-turma-capacitacao" },
      { name: "Total Periodo/Parceiros", href: "/pedagogico/total-periodo-parceiros" },
      { name: "Total Periodo/Faltas", href: "/pedagogico/total-periodo-faltas" },
      { name: "Contagem Faltas Período", href: "/pedagogico/contagem-faltas" },
      { name: "Conteúdos Lecionados no Perí...", href: "/pedagogico/conteudos-lecionados" },
      { name: "Aulas dadas no período", href: "/pedagogico/aulas-dadas" },
      { name: "Controle de Faltas (8 faltas)", href: "/pedagogico/controle-faltas-oito" },
      { name: "Estatísticas Presença por Jovem", href: "/pedagogico/estatisticas-presenca-jovem" },
    ],
  },
];

function SidebarItem({ item, depth = 0 }: { item: MenuItem, depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(pathname.startsWith(item.href) && item.href !== "#");
  
  const isActive = pathname === item.href;
  const hasSub = item.subMenu && item.subMenu.length > 0;

  const baseClasses = "flex items-center transition font-medium duration-300 ease-in-out h-auto min-h-[3rem] w-full px-4 hover:bg-[#123A83] text-sm py-2";
  const activeClasses = "text-[#FFFF] bg-[#123A83]";
  const inactiveClasses = "text-[#F6F6F6]";
  const blueClasses = "text-[#52E8FB] font-bold";

  return (
    <div className="w-full">
      <div 
        className={`${baseClasses} ${isActive ? activeClasses : item.isBlue ? blueClasses : inactiveClasses} cursor-pointer`}
        onClick={() => hasSub && setIsExpanded(!isExpanded)}
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
      {hasSub && isExpanded && (
        <div className="bg-[#0b2452]/30 w-full border-l-2 border-white/5">
          {item.subMenu!.map((sub) => (
            <SidebarItem key={sub.href + sub.name} item={sub} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PedagogicoSidebar() {
  return (
    <div className="flex flex-col bg-[#0F306D] w-64 h-full overflow-y-auto overflow-x-hidden border-r border-[#123A83]/50">
      <div className="py-2">
        {menuItems.map((item) => (
          <SidebarItem key={item.href + item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
