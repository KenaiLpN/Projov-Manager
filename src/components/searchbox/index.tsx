import React, { ChangeEvent, KeyboardEvent, useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
}
const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = "Buscar...",
  initialValue = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
    }
  };
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
export default SearchBox;