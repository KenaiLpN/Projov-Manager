import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as AxiosError<ApiErrorResponse>;
  return apiError.response?.data?.message ?? apiError.response?.data?.error ?? fallback;
}
