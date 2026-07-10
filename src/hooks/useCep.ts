import { useCallback, useState } from "react";
import { CepAddress, fetchCepAddress } from "@/services/cepService";

type UseCepOptions = {
  onSuccess: (address: CepAddress) => void;
  onNotFound?: () => void;
  onError?: () => void;
};

export function useCep({ onSuccess, onNotFound, onError }: UseCepOptions) {
  const [loadingCep, setLoadingCep] = useState(false);

  const searchCep = useCallback(
    async (cep: string) => {
      setLoadingCep(true);
      try {
        const address = await fetchCepAddress(cep);
        if (!address) {
          onNotFound?.();
          return;
        }
        onSuccess(address);
      } catch {
        onError?.();
      } finally {
        setLoadingCep(false);
      }
    },
    [onError, onNotFound, onSuccess],
  );

  return { loadingCep, searchCep };
}
