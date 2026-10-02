"use client";

import { useContext } from "react";
import { InterfacePreferencesContext } from "@/components/InterfacePreferencesProvider";

export function useInterfacePreferences() {
  const context = useContext(InterfacePreferencesContext);
  if (!context) throw new Error("useInterfacePreferences requires InterfacePreferencesProvider");
  return context;
}
