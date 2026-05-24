"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { UserMenu } from "../perfildropdown";
import { NotificationsMenu } from "../notifications";
import { getRoleLabel } from "@/utils/roles";

interface NavItem {
  name: string;
  href: string;
  isBlue?: boolean;
}

interface NavItemWithSub extends NavItem {
  subMenu?: NavItemWithSub[];
}

const navItems: NavItemWithSub[] = [
  {
    name: "Cadastros",
    href: "/cadastros/usuarios",
    subMenu: [
      { name: "Usuários", href: "/cadastros/usuarios" },
      { name: "Unidades", href: "/cadastros/unidades" },
      { name: "Instituições de Ensino", href: "/cadastros/instituicoes" },
      {
        name: "Situações do Participante",
        href: "/cadastros/situacoes-participante",
      },
      { name: "Ocorrências", href: "/cadastros/ocorrencias" },
      { name: "Profissões", href: "/cadastros/profissoes" },
      { name: "Graus de Parentesco", href: "/cadastros/grau-parentesco" },
      { name: "Graus de Escolaridade", href: "/cadastros/graus-escolaridade" },
      { name: "Feriados", href: "/cadastros/feriados" },
      {
        name: "Motivos de Desligamento",
        href: "/cadastros/motivos-desligamento",
      },
      {
        name: "Instituições Parceiras",
        href: "/cadastros/instituicoes-parceiras",
      },
      {
        name: "Status Encaminhamento",
        href: "/cadastros/status-encaminhamento",
      },
      { name: "Regiões", href: "/cadastros/regioes" },
    ],
  },
  {
    name: "Empresa",
    href: "/empresa/cadramosatividade",
    subMenu: [
      { name: "Ramos de Atividade", href: "/empresa/cadramosatividade" },
      { name: "Empresas", href: "/empresa/cadempresas" },
      { name: "Unidades de Parceiro", href: "/empresa/cadunidadeparceiro" },
      { name: "Orientadores", href: "/empresa/cadoriantadores" },
      { name: "Registro GI", href: "/empresa/cadregistrogi" },
    ],
  },
  {
    name: "Acessos",
    href: "/acessos/funcoes",
    subMenu: [
      { name: "Cadastro de Funções", href: "/acessos/funcoes" },
      { name: "Designar Funções", href: "/acessos/designar" },
    ],
  },
  { name: "Vagas", href: "/vagas" },
  {
    name: "Aprendiz",
    href: "/aprendizes",
  },
  {
    name: "Pedagógico",
    href: "/pedagogico",
    subMenu: [
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
        name: "Lista Carga Horária Final",
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
          {
            name: "Lista Presença Capacitação",
            href: "/pedagogico/presenca-capacitacao",
          },
          {
            name: "Lista Presença Introdutório",
            href: "/pedagogico/presenca-introdutorio",
          },
        ],
      },
      {
        name: "Cronogramas",
        href: "#",
        subMenu: [
          { name: "Cronogramas", href: "/pedagogico/cronogramas" },
          {
            name: "Geração de Cronograma Turma...",
            href: "/pedagogico/gerar-cronograma",
          },
          {
            name: "Gerar Cronograma Turma/Sem...",
            href: "/pedagogico/gerar-cronograma-semanal",
          },
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
          {
            name: "Lançar Faltas Capacitação",
            href: "/pedagogico/faltas-capacitacao",
          },
          {
            name: "Lançar Faltas Informática",
            href: "/pedagogico/faltas-informatica",
          },
        ],
      },
      {
        name: "Controle de Presença",
        href: "/pedagogico/presenca-data-turma",
      },
    ],
  },
  { name: "Estatísticas", 
    href: "/estatisticas" ,
    subMenu: [
      {name: "Participantes Por Situação",href: "/estatisticas/part_por_situacao"},
      {name: "Estatística Geral Aprendizes",href: "/estatisticas/geral_aprendiz"},  
      {name: "Aprendizes Por Parceiro",href: "/estatisticas/aprendiz_por_parceiro"},  
      {name: "Gestão De Avaliações",href: "/estatisticas/gestao_avaliacao"},  
      {name: "Avaliações Disponíveis Educadores",href: "/estatisticas/avaliacoes_educadores"},  
      {name: "Avaliações Disponíveis Empresa",href: "/estatisticas/avaliacoes_empresa"},  
      {name: "Avaliações Realizadas",href: "/estatisticas/avaliacoes_realizadas"},  
      {name: "Relatório LOG",href: "/estatisticas/relatorio_log"},  
    ],
  },
];

function SubMenuItem({ 
  item, 
  depth = 0,
  isExpanded,
  onToggle
}: { 
  item: NavItemWithSub; 
  depth?: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const isSubActive = pathname === item.href;
  const hasSub = item.subMenu && item.subMenu.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 cursor-pointer ${
          isSubActive
            ? "bg-[#123a83] text-[#F6F6E2] font-bold"
            : item.isBlue
            ? "text-[#52E8FB] font-black hover:bg-[#123a83]"
            : "text-gray-100 hover:bg-[#123a83] hover:text-[#F6F6E2]"
        }`}
        onClick={() => onToggle()}
      >
        <Link 
          href={item.href} 
          className="flex-1"
          onClick={(e) => item.href === "#" && e.preventDefault()}
        >
          <span style={{ paddingLeft: depth > 0 ? `${depth * 1.5}rem` : 0 }}>
            {item.name}
          </span>
        </Link>
        {hasSub && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-2 opacity-50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
          <SubMenuGroup items={item.subMenu!} depth={depth + 1} />
        )}
      </div>
    </div>
  );
}

function SubMenuGroup({ items, depth = 0 }: { items: NavItemWithSub[]; depth?: number }) {
  const pathname = usePathname();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
    <div className={`flex flex-col ${depth > 0 ? 'bg-[#0b2452]/50' : 'py-2'}`}>
      {items.map((sub, index) => (
        <SubMenuItem 
          key={sub.name + index} 
          item={sub} 
          depth={depth} 
          isExpanded={expandedIndex === index}
          onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

export function Header() {
  const [user, setUser] = useState({
    nome: "",
    role: "",
  });
  const [openedMenu, setOpenedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("projov_user");
    if (dadosSalvos) {
      const usuarioParseado = JSON.parse(dadosSalvos);
      setUser({
        nome: usuarioParseado.UsuNome,
        role: usuarioParseado.UsuTipo || "Sem cargo",
      });
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenedMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setOpenedMenu(null);
  }, [pathname]);

  const baseLinkClasses =
    "flex items-center gap-2 text-[#52E8FB] transition font-medium duration-500 ease-in-out h-20 p-5";
  const activeLinkClasses =
    "text-[#F6F6F6] bg-[#123a83] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive =
    "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#123a83]";

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };

  return (
    <header className="flex bg-[#0f306d] border-b border-[#e4e9f0] justify-between items-center">
      <div className="ml-5">
        <h1 className="ml-15 m-2 flex text-[#F6F6F6] text-2xl font-bold cursor-pointer hover:bg-[#123a83] rounded-lg justify-center items-center w-50 h-10">
          <Link className="flex" href="/">PROSIS <p className="text-[#F6F6F6] text-xs m-2">home</p></Link>
        </h1>
        <p className="text-[#F6F6F6] text-xs m-2">
          Rua Pará, nº 159 - BARUERI - SP. Tel.: (11) 4166-2630
        </p>
      </div>
      {user.role !== "APRENDIZ" && (
        <div className="flex h-20" ref={menuRef}>
          {navItems.map((item) => {
          const hasSub = item.subMenu && item.subMenu.length > 0;
          const isMenuOpen = openedMenu === item.name;

          const content = (
            <div className={`${getLinkClasses(item.href)} cursor-pointer flex items-center`}>
              <span>{item.name}</span>
              {hasSub && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 opacity-50 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          );

          return (
            <div key={item.name} className="relative flex items-center h-full">
              {hasSub ? (
                <button 
                  onClick={() => setOpenedMenu(isMenuOpen ? null : item.name)}
                  className="h-full focus:outline-none"
                >
                  {content}
                </button>
              ) : (
                <Link href={item.href} className="h-full">
                  {content}
                </Link>
              )}
              
              {hasSub && isMenuOpen && (
                <div className="absolute top-20 left-0 w-80 bg-[#0f306d] shadow-2xl z-50 backdrop-blur-sm bg-opacity-95 rounded-b-lg overflow-y-auto max-h-[85vh]">
                  <SubMenuGroup items={item.subMenu!} />
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
      <div className="items-center gap-6 pr-5 hidden lg:flex">
        {user.role !== "APRENDIZ" && <NotificationsMenu />}
        <UserMenu nome={user.nome} role={getRoleLabel(user.role)} />
      </div>
    </header>
  );
}
