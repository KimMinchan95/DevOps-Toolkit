import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";
export type LanguagePreference = "system" | "ko" | "en";

type PersistedPreferences = {
  theme: ThemePreference;
  language: LanguagePreference;
};

type PreferencesState = PersistedPreferences & {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
};

const themeKey = "devops-toolkit.theme";
const languageKey = "devops-toolkit.language";

function isTheme(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isLanguage(value: unknown): value is LanguagePreference {
  return value === "system" || value === "ko" || value === "en";
}

export function getSystemLanguage(): "ko" | "en" {
  return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function resolveLanguage(language: LanguagePreference, systemLanguage = getSystemLanguage()) {
  return language === "system" ? systemLanguage : language;
}

function readPreference<T>(key: string, isValid: (value: unknown) => value is T, fallback: T) {
  try {
    const saved = localStorage.getItem(key);
    return isValid(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

const preferencesStorage: PersistStorage<PersistedPreferences> = {
  getItem: () => ({
    state: {
      theme: readPreference(themeKey, isTheme, "system"),
      language: readPreference(languageKey, isLanguage, "system"),
    },
  }),
  setItem: (_name, value) => {
    try {
      localStorage.setItem(themeKey, value.state.theme);
      localStorage.setItem(languageKey, value.state.language);
    } catch {
      // Preferences remain active for this session if browser storage is unavailable.
    }
  },
  removeItem: () => {
    try {
      localStorage.removeItem(themeKey);
      localStorage.removeItem(languageKey);
    } catch {
      // Ignore unavailable storage.
    }
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "system",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "devops-toolkit.preferences",
      storage: preferencesStorage,
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    },
  ),
);
