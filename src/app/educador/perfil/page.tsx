"use client";

import { useEffect, useState } from "react";
import { Save, User } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";

type EducadorProfile = {
  EducCodigo: number;
  EducNome: string | null;
  EducCPF: string | null;
  EducEMail: string | null;
  EducTelefone: string | null;
  EducTelefoneCelular: string | null;
  EducEndereco: string | null;
  EducNumeroEndereco: string | null;
  EducComplemento: string | null;
  EducBairro: string | null;
  EducCidade: string | null;
  EducUF: string | null;
  EducCEP: string | null;
};

const editableFields: { name: keyof EducadorProfile; label: string }[] = [
  { name: "EducNome", label: "Nome completo" },
  { name: "EducCPF", label: "CPF" },
  { name: "EducEMail", label: "E-mail" },
  { name: "EducTelefoneCelular", label: "Celular" },
  { name: "EducTelefone", label: "Telefone" },
  { name: "EducCEP", label: "CEP" },
  { name: "EducEndereco", label: "Endereço" },
  { name: "EducNumeroEndereco", label: "Número" },
  { name: "EducComplemento", label: "Complemento" },
  { name: "EducBairro", label: "Bairro" },
  { name: "EducCidade", label: "Cidade" },
  { name: "EducUF", label: "UF" },
];

export default function EducadorPerfilPage() {
  const [profile, setProfile] = useState<EducadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("projov_user");
    const codigo = session ? JSON.parse(session).UsuCodigo : null;
    if (!codigo) return;

    api.get(`/educadores/${codigo}`)
      .then((response) => setProfile(response.data))
      .catch(() => toast.error("Não foi possível carregar seu cadastro."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put(`/educadores/${profile.EducCodigo}`, profile);
      toast.success("Cadastro atualizado com sucesso.");
    } catch {
      toast.error("Não foi possível atualizar seu cadastro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-full items-center justify-center text-gray-500">Carregando cadastro...</div>;
  }

  if (!profile) {
    return <div className="flex min-h-full items-center justify-center text-red-600">Cadastro não encontrado.</div>;
  }

  return (
    <div className="min-h-full bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center justify-between bg-[#133c86] px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <User size={28} />
            <div>
              <h1 className="text-2xl font-bold">Meu Cadastro de Educador</h1>
              <p className="text-sm text-blue-100">Código #{profile.EducCodigo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-[#133c86] disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </header>

        <div className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2">
          {editableFields.map(({ name, label }) => (
            <label key={name} className="flex flex-col gap-1.5 text-sm font-semibold text-gray-600">
              {label}
              <input
                value={String(profile[name] ?? "")}
                onChange={(event) => setProfile((current) => current ? { ...current, [name]: event.target.value } : current)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
