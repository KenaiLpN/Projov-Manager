"use client";
import React, { ReactNode } from "react";
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
};
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-5xl" }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-1000 flex justify-center items-center p-4 bg-black/20 backdrop-blur-sm backdrop-saturate-150"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl p-6 relative w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 transition-colors text-3xl font-light cursor-pointer z-50"
        >
          &times;
        </button>
        <div className="overflow-y-auto px-1">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
