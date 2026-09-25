import { AxiosError } from "axios";
import { InvalidApiResponseError } from "./apiResponse";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof InvalidApiResponseError) return error.message;
  const apiError = error as AxiosError<ApiErrorResponse> | null;
  const data = apiError?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  return fallback;
}
