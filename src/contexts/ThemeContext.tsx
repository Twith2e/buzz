import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { THEME_KEY } from "@/data/data";
import { Theme } from "@/utils/types";
import { useGetSettings } from "@/services/settings/settings";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updatingSettings: boolean;
  setUpdatingSettings: (updatingSettings: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeContext must be used within a ThemeContextProvider"
    );
  }
  return context;
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useGetSettings();

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      return saved || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    if (settings?.settings.theme) {
      setTheme(settings.settings.theme);
    }
  }, [settings]);

  const [updatingSettings, setUpdatingSettings] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  // Listen for system theme changes if using system preference
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, updatingSettings, setUpdatingSettings }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
