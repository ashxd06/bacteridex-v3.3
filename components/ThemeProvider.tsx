"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "dark" | "light";

const ThemeContext = createContext<{ tema: Tema; alternar: () => void }>({
  tema: "dark",
  alternar: () => {}
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const guardado = window.localStorage.getItem("bacteridex_tema") as Tema | null;
    if (guardado) setTema(guardado);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", tema === "light");
    window.localStorage.setItem("bacteridex_tema", tema);
  }, [tema]);

  return (
    <ThemeContext.Provider
      value={{ tema, alternar: () => setTema((t) => (t === "dark" ? "light" : "dark")) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
