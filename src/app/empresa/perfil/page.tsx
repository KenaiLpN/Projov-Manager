"use client";

import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";

type EmpresaProfile = {
  ParCodigo: number;
  ParDescricao: string;
  ParNomeFantasia: string | null;
  ParCNPJ: string | null;
  ParEmail: string | null;
  ParTelefone: string | null;
  ParCelular: string | null;
  ParEndereco: string | null;
  ParNumeroEndereco: string | null;
  ParComplemento: string | null;
  ParBairro: string | null;
  ParCidade: string | null;
  ParEstado: string | null;
  ParCEP: string | null;
};

const editableFields: { name: keyof EmpresaProfile; label: string }[] = [
  { name: "ParDescricao", label: "Razão social" },
  { name: "ParNomeFantasia", label: "Nome fantasia" },
  { name: "ParCNPJ", label: "CNPJ" },
  { name: "ParEmail", label: "E-mail" },
  { name: "ParCelular", label: "Celular" },
  { name: "ParTelefone", label: "Telefone" },
  { name: "ParCEP", label: "CEP" },
  { name: "ParEndereco", label: "Endereço" },
  { name: "ParNumeroEndereco", label: "Número" },
  { name: "ParComplemento", label: "Complemento" },
  { name: "ParBairro", label: "Bairro" },
  { name: "ParCidade", label: "Cidade" },
  { name: "ParEstado", label: "UF" },
];

export default function EmpresaPerfilPage() {
  const [profile, setProfile] = useState<EmpresaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("projov_user");
    const codigo = session ? JSON.parse(session).UsuCodigo : null;
    if (!codigo) return;

    api.get(`/parceiros/${codigo}`)
      .then((response) => setProfile(response.data))
      .catch(() => toast.error("Não foi possível carregar o cadastro da empresa."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put(`/parceiros/${profile.ParCodigo}`, profile);
      toast.success("Cadastro atualizado com sucesso.");
    } catch {
      toast.error("Não foi possível atualizar o cadastro.");
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
    <ParceiroPageShell>
      <div className="min-h-full bg-gray-100 p-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="flex items-center justify-between bg-[#133c86] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <Building2 size={28} />
              <div>
                <h1 className="text-2xl font-bold">Cadastro da Empresa Parceira</h1>
                <p className="text-sm text-blue-100">Código #{profile.ParCodigo}</p>
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
    </ParceiroPageShell>
  );
}
