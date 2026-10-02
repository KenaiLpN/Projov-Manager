"use client";

import { createContext, useContext } from "react";

/** Keeps legacy section menus available when rendered outside the app shell. */
export const NavigationContext = createContext(false);

export function useGlobalNavigation() {
  return useContext(NavigationContext);
}
