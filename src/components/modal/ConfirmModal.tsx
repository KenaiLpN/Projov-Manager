"use client";
import React from "react";
import Modal from "./index";
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "danger" | "success" | "primary";
}
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  message = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  cancelText = "Cancelar",
  loading = false,
  variant,
}: ConfirmModalProps) => {
  const normalizedConfirmText = confirmText.toLocaleLowerCase("pt-BR");
  const normalizedTitle = title.toLocaleLowerCase("pt-BR");
  const resolvedVariant =
    variant ??
    (normalizedConfirmText.includes("salvar") ||
    normalizedTitle.includes("alteração") ||
    normalizedTitle.includes("alteracao")
      ? "success"
      : "danger");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            className="prosis-modal-button prosis-modal-button-secondary flex-1 px-4 py-2 font-semibold cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            data-variant={resolvedVariant}
            className="prosis-modal-button prosis-modal-button-primary flex-1 px-4 py-2 font-semibold cursor-pointer"
          >
            {loading ? "Excluindo..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmModal;
