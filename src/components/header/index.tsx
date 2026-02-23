"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { UserMenu } from "../perfildropdown";
import { NotificationsMenu } from "../notifications";
import { getRoleLabel } from "@/utils/roles";

interface NavItem {
  name: string;
  href: string;
}

interface NavItemWithSub extends NavItem {
  subMenu?: NavItem[];
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
      { name: "Empresas", href: "/empresa/cadramosatividade" },
      { name: "Unidades de Parceiro", href: "/empresa/cadunidadeparceiro" },
      { name: "Orientadores", href: "/empresa/cadoriantadores" },
      { name: "Consulta Parceiros", href: "/empresa/consultaparceiros" },
      {
        name: "Consulta Unidades",
        href: "/empresa/consultaunidadesparceiro",
      },
      { name: "Boletos", href: "/empresa/boletos" },
      { name: "Nota Fiscal", href: "/empresa/nfe" },
    ],
  },
  { name: "Acessos", href: "/acessos" },
  { name: "Vagas", href: "/vagas" },
  {
    name: "Aprendiz",
    href: "/aprendizes",
    subMenu: [
      { name: "Cadastro de Aprendizes", href: "/aprendizes" },
      { name: "Ocorrências", href: "/aprendizes/ocorrencias" },
      { name: "Aniversariantes", href: "/aprendizes/aniversariantes" },
      { name: "Lista Ativos", href: "/aprendizes/ativos" },
      { name: "Pesquisa Candidatos", href: "/aprendizes/candidatos" },
    ],
  },
  {
    name: "Pedagógico",
    href: "/pedagogico",
    subMenu: [
      { name: "Cadastro de Cursos", href: "/pedagogico/cursos" },
      { name: "Disciplinas", href: "/pedagogico/disciplinas" },
      { name: "Turmas", href: "/pedagogico/turmas" },
      { name: "Conceitos", href: "/pedagogico/conceitos" },
      { name: "Áreas de atuação", href: "/pedagogico/areas" },
    ],
  },
  { name: "Estatísticas", href: "/estatisticas" },
];

export function Header() {
  const [user, setUser] = useState({
    nome: "",
    role: "",
  });

  const pathname = usePathname();

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

  const baseLinkClasses =
    "flex items-center gap-2 text-[#52E8FB] transition font-medium duration-500 ease-in-out h-20 p-5";
  const activeLinkClasses =
    "text-[#F6F6F6] bg-[#253341a4] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive =
    "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#253341a4]";

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };

  return (
    <header className="flex bg-[#34495E] border-b border-[#e4e9f0] justify-between items-center">
      <div className="ml-5">
        <h1 className="ml-15 m-2 flex text-[#F6F6F6] text-2xl font-bold cursor-pointer hover:bg-[#253341a4] rounded-lg justify-center items-center w-50 h-10">
          <Link href="/">PROSIS</Link>
        </h1>
        <p className="text-[#F6F6F6] text-xs m-2">
          Rua Pará, nº 159 - BARUERI - SP. Tel.: (11) 4166-2630
        </p>
      </div>
      <div className="flex h-20">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(
            item.href === "/" ? "/NONE" : item.href,
          );

          return (
            <div key={item.name} className="relative group flex items-center">
              <Link href={item.href} className={getLinkClasses(item.href)}>
                <span>{item.name}</span>
                {item.subMenu && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-300"
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
              </Link>

              {item.subMenu && (
                <div className="absolute top-20 left-0 w-64 bg-[#34495E] shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 backdrop-blur-sm bg-opacity-95 rounded-b-lg overflow-hidden">
                  <div className="flex flex-col py-2">
                    {item.subMenu.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`px-6 py-3 text-sm transition-colors duration-200 ${
                            isSubActive
                              ? "bg-[#253341a4] text-[#F6F6E2] font-bold"
                              : "text-gray-100 hover:bg-[#2c3e50] hover:text-[#F6F6E2]"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 pr-5">
        <NotificationsMenu />
        <UserMenu nome={user.nome} role={getRoleLabel(user.role)} />
      </div>
    </header>
  );
}
