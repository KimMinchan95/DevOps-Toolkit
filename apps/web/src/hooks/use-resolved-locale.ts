import { useEffect, useState } from "react";
import { getSystemLanguage, resolveLanguage, usePreferencesStore } from "../stores/preferences";

export function useResolvedLocale() {
  const language = usePreferencesStore((state) => state.language);
  const [systemLanguage, setSystemLanguage] = useState(getSystemLanguage);

  useEffect(() => {
    const updateLanguage = () => setSystemLanguage(getSystemLanguage());
    window.addEventListener("languagechange", updateLanguage);
    return () => window.removeEventListener("languagechange", updateLanguage);
  }, []);

  return resolveLanguage(language, systemLanguage);
}
