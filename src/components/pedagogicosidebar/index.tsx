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
    name: "Cadastro de Cursos",
    href: "/pedagogico/cursos",
  },
  {
    name: "Disciplinas",
    href: "/pedagogico/disciplinas",
  },
  {
    name: "Turmas",
    href: "/pedagogico/turmas",
  },
  {
    name: "Conceitos",
    href: "/pedagogico/conceitos",
  },
  {
    name: "Áreas de atuação",
    href: "/pedagogico/areas",
  },
];
export function PedagogicoSidebar() {
  const pathname = usePathname();
  const baseLinkClasses =
    "flex items-center transition font-medium duration-300 ease-in-out h-14 w-full justify-center hover:bg-[#123A83] ";
  const activeLinkClasses =
    "text-[#FFFF] bg-[#123A83] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive =
    "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#123A83]";
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };
  return (
    <div className="flex flex-col bg-[#0F306D] w-60 h-full items-center">
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
