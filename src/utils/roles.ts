export const ROLE_MAP: Record<string, string> = {
  A: "Administrador",
  C: "Recepção",
  D: "Desligado",
  E: "Empresarial",
  P: "Pedagógico",
  S: "Pesquisa",
  T: "Técnico",
  DEV: "Desenvolvedor",
  APRENDIZ: "Aprendiz",
};
export const getRoleLabel = (code: string | null | undefined): string => {
  if (!code) return "Não definido";
  const upperCode = code.toUpperCase();
  return ROLE_MAP[upperCode] || code;
};
export const ROLE_OPTIONS = [
  { value: "A", label: "Administrador" },
  { value: "C", label: "Recepção" },
  { value: "E", label: "Empresarial" },
  { value: "P", label: "Pedagógico" },
  { value: "S", label: "Pesquisa" },
  { value: "T", label: "Técnico" },
  { value: "D", label: "Desligado" },
  { value: "APRENDIZ", label: "Aprendiz" },
];