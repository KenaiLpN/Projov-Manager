"use client";
import React, { ReactNode } from "react";
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};
const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-999 flex justify-center items-center p-4 bg-black/40 backdrop-blur-sm backdrop-saturate-150"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl p-6 relative w-250"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl cursor-pointer"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
export default Modal;