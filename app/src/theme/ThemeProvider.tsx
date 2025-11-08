import React, { createContext, useContext, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

import { colors } from "./colors";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  systemScheme: ColorSchemeName;
  toggleTheme: () => void;
  colors: typeof colors;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const toggleTheme = () => {
    setMode((current) => {
      if (current === "system") {
        return systemScheme === "dark" ? "light" : "dark";
      }
      return current === "dark" ? "light" : "dark";
    });
  };

  const value = useMemo(
    () => ({
      mode,
      systemScheme,
      toggleTheme,
      colors
    }),
    [mode, systemScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
};

