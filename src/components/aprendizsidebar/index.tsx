"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
interface MenuItem {
  name: string;
  href: string;
}
const menuItems: MenuItem[] = [
  {
    name: "Cadastro de Aprendizes",
    href: "/aprendizes",
  },
  {
    name: "Ocorrências",
    href: "/aprendizes/ocorrencias",
  },
  {
    name: "Aniversariantes",
    href: "/aprendizes/aniversariantes",
  },
  {
    name: "Lista Ativos",
    href: "/aprendizes/ativos",
  },
  {
    name: "Pesquisa Candidatos",
    href: "/aprendizes/candidatos",
  },
];
export function AprendizSidebar() {
  const pathname = usePathname();
  const baseLinkClasses =
    "flex items-center transition font-medium duration-300 ease-in-out h-14 w-full justify-center hover:bg-[#253341a4] ";
  const activeLinkClasses =
    "text-[#FFFF] bg-[#253341a4] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive =
    "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#1854af]";
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };
  return (
    <div className="flex flex-col bg-[#34495E] w-60 h-full items-center">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={getLinkClasses(item.href)}
        >
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
}