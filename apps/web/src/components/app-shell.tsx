import { useEffect, type ReactNode } from "react";
import { Braces, Languages } from "lucide-react";
import { languageOptions, themeOptions } from "../constants/preference-options";
import { messages } from "../locales";
import { usePreferencesStore, type LanguagePreference, type ThemePreference } from "../stores/preferences";

const preferenceClass = "flex h-[34px] items-center gap-[7px] rounded-[7px] border border-line bg-surface px-[9px] text-muted max-[520px]:h-[31px] max-[520px]:gap-1 max-[520px]:px-1.5";
const preferenceSelectClass = "max-w-[124px] cursor-pointer border-0 bg-transparent text-[11px] text-foreground outline-none max-[520px]:max-w-[85px] max-[520px]:text-[10px] [&_option]:bg-surface [&_option]:text-foreground";
const preferenceIconClass = "size-[15px] shrink-0 max-[520px]:size-[13px]";

type AppShellProps = {
  locale: "ko" | "en";
  navigate: (href: string) => void;
  children: ReactNode;
};

export function AppShell({ locale, navigate, children }: AppShellProps) {
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const t = messages[locale].shell;
  const ThemeIcon = themeOptions.find((option) => option.value === theme)?.icon ?? themeOptions[0].icon;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = locale;
  }, [theme, locale]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateThemeColor = () => {
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        "content",
        theme === "system" ? (media.matches ? "#111315" : "#f5f6f3") : theme === "dark" ? "#111315" : "#f5f6f3",
      );
    };
    updateThemeColor();
    media.addEventListener("change", updateThemeColor);
    return () => media.removeEventListener("change", updateThemeColor);
  }, [theme]);

  return (
    <main className="flex min-h-screen flex-col px-[8.1vw] max-[800px]:px-[5vw] max-[520px]:px-[18px]">
      <header className="flex h-[76px] w-full items-center justify-between border-b border-line max-[520px]:h-[66px]">
        <a
          className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.4px] text-foreground no-underline max-[520px]:text-xs"
          href="/"
          aria-label={t.homeLabel}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            navigate("/");
          }}
        >
          <span className="grid size-[31px] place-items-center rounded-[9px] bg-accent-soft text-accent max-[520px]:size-7">
            <Braces size={19} strokeWidth={2.4} />
          </span>
          <span>DevOps <b className="font-normal text-muted">Toolkit</b></span>
        </a>
        <div className="flex items-center gap-[9px] max-[520px]:gap-[5px]">
          <label className={preferenceClass} aria-label={t.appearance}>
            <ThemeIcon className={preferenceIconClass} />
            <select className={preferenceSelectClass} value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)}>
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>{t[option.label]}</option>
              ))}
            </select>
          </label>
          <label className={preferenceClass} aria-label={t.language}>
            <Languages className={preferenceIconClass} />
            <select className={preferenceSelectClass} value={language} onChange={(event) => setLanguage(event.target.value as LanguagePreference)}>
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>{t[option.label]}</option>
              ))}
            </select>
          </label>
        </div>
      </header>
      {children}
      <footer className="flex h-[47px] items-center justify-between text-[9px] tracking-[0.7px] text-muted max-[520px]:text-[8px]">
        <span className="font-mono text-[8px] tracking-[1px]">
          DEVOPS TOOLKIT <i className="px-1 text-accent not-italic">·</i> 0.1.0
        </span>
        <span className="flex items-center gap-2 text-[10px] tracking-normal max-[520px]:text-[9px]">
          <i className="block size-[5px] rounded-full bg-accent" />
          {t.privacy}
        </span>
      </footer>
    </main>
  );
}
