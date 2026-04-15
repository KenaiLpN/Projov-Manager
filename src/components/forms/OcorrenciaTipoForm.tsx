import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OcorrenciaTipo } from "@/services/ocorrenciaTipoService";
import {
  ocorrenciaTipoFormSchema,
  OcorrenciaTipoFormData as FormData,
} from "@/lib/schemas/forms";
interface OcorrenciaTipoFormProps {
  initialData?: OcorrenciaTipo | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
const OcorrenciaTipoForm: React.FC<OcorrenciaTipoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ocorrenciaTipoFormSchema),
    defaultValues: {
      OcoDescricao: "",
      OcoTipo: "",
    },
  });
  useEffect(() => {
    if (initialData) {
      reset({
        OcoDescricao: initialData.OcoDescricao || "",
        OcoTipo: initialData.OcoTipo || "",
      });
    } else {
      reset({
        OcoDescricao: "",
        OcoTipo: "",
      });
    }
  }, [initialData, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="OcoDescricao"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição
        </label>
        <input
          type="text"
          id="OcoDescricao"
          {...register("OcoDescricao")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Ex: Falta Injustificada"
        />
        {errors.OcoDescricao && (
          <p className="mt-1 text-sm text-red-600">
            {errors.OcoDescricao.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="OcoTipo"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo (1 Caractere)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="OcoTipo"
            maxLength={1}
            {...register("OcoTipo")}
            className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border uppercase"
            placeholder="P/N"
          />
          <span className="text-xs text-gray-500">
            Ex: P (Positivo), N (Negativo)
          </span>
        </div>
        {errors.OcoTipo && (
          <p className="mt-1 text-sm text-red-600">{errors.OcoTipo.message}</p>
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[#133c86] border border-transparent rounded-md shadow-sm hover:bg-[#0c2a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  );
};
export default OcorrenciaTipoForm;