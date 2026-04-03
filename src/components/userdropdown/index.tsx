import { Dropdown } from "primereact/dropdown";
import { ROLE_OPTIONS } from "@/utils/roles";
interface UserDropDownProps {
  selectedRole: string | null;
  onRoleChange: (role: string) => void;
}
export default function UserDropDown({
  selectedRole,
  onRoleChange,
}: UserDropDownProps) {
  return (
    <div className="flex items-center justify-center w-full bg-[#F3F4F6] rounded-xl py-1 px-2 border-2 border-[#34495E] focus-within:border-blue-500 outline-none">
      <Dropdown
        value={selectedRole}
        onChange={(e) => onRoleChange(e.value)}
        options={ROLE_OPTIONS}
        optionLabel="label"
        optionValue="value"
        className="text-gray-500 p-2 w-full"
        placeholder="Selecione o perfil"
        panelClassName="bg-white border border-gray-300 shadow-lg rounded-b-md p-2"
      />
    </div>
  );
}
