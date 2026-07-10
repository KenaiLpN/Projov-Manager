export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export async function fetchCepAddress(cep: string): Promise<CepAddress | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  const response = await fetch(`/api/cep/${cleanCep}`);
  if (!response.ok) {
    throw new Error("Erro ao consultar CEP.");
  }

  const data = await response.json();
  if (data?.erro) return null;

  return {
    cep: cleanCep,
    logradouro: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    localidade: data.localidade ?? "",
    uf: data.uf ?? "",
  };
}
