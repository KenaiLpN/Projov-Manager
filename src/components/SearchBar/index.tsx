"use client";
import { X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputWidth?: string;
  searchLabel?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  onKeyDown,
  placeholder = "Buscar...",
  inputWidth = "w-72",
  searchLabel = "Pesquisar",
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
    onKeyDown?.(e);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`p-2 pr-10 ${inputWidth} rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]`}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Limpar pesquisa"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-[#133c86] text-white font-semibold rounded hover:bg-[#0f2e6b] transition-colors cursor-pointer"
      >
        {searchLabel}
      </button>
    </div>
  );
}
