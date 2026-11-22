import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import type { LanguagePreference, ThemePreference } from "../stores/preferences";

type ShellLabel = "system" | "light" | "dark" | "korean" | "english";

export const themeOptions: readonly { value: ThemePreference; label: ShellLabel; icon: LucideIcon }[] = [
  { value: "system", label: "system", icon: Monitor },
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
];

export const languageOptions: readonly { value: LanguagePreference; label: ShellLabel }[] = [
  { value: "system", label: "system" },
  { value: "ko", label: "korean" },
  { value: "en", label: "english" },
];
