import { useState, useRef, useEffect } from "react";
import { User, Settings, ChevronDown, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { BotaoSair } from "../LogoutButton";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "prosis-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Tema continua aplicado na sessao atual mesmo sem persistencia local.
  }
}

interface UserMenuProps {
  nome: string;
  role: string;
}
export function UserMenu({ nome, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(" ").filter(Boolean);
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

  const handleThemeToggle = () => {
    const nextTheme: Theme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <div className="relative" ref={menuRef}>
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#123a83] transition-colors duration-200 outline-none focus:ring-2 focus:ring-gray-500/10"
      >
        <div className="flex items-end gap-2">
          {}
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            {getInitials(nome)}
          </div>
          <div className="flex flex-col">
            {" "}
            <span className="text-sm font-medium text-[#ffff]">{nome}</span>
            <span className="text-xs text-[#ffff]">{role}</span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {}
          <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <p className="text-sm font-medium text-gray-900">{nome}</p>
            <p className="text-xs text-gray-500 truncate">{role}</p>
          </div>
          {}
          <div className="py-1">
            <button
              type="button"
              onClick={handleThemeToggle}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              aria-pressed={isDark}
            >
              <span className="flex items-center">
                {isDark ? (
                  <Sun size={16} className="mr-3" />
                ) : (
                  <Moon size={16} className="mr-3" />
                )}
                Modo escuro
              </span>
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isDark ? "bg-[#52E8FB]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`theme-toggle-thumb inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isDark ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </span>
            </button>
            <Link
              href="/perfil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              <User size={16} className="mr-3" />
              Meu Perfil
            </Link>
            <Link
              href="/configuracoes"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            >
              <Settings size={16} className="mr-3" />
              Configurações
            </Link>
          </div>
          <BotaoSair />
          <div className="border-t border-gray-100 py-1"></div>
        </div>
      )}
    </div>
  );
}
