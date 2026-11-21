import { useEffect, useState } from "react";
import { Braces, Languages, Monitor, Moon, Sun } from "lucide-react";
import {
  getSystemLanguage,
  resolveLanguage,
  usePreferencesStore,
  type LanguagePreference,
  type ThemePreference,
} from "./stores/preferences";

const messages = {
  en: {
    eyebrow: "A SMALL WORKSPACE FOR EVERYDAY DEVELOPMENT",
    title: "DevOps Toolkit",
    description: "The essentials, close at hand.",
    ready: "Your workspace is ready to take shape.",
    next: "The first tools will be JSON Formatter, Unix Timestamp, and UUID Generator.",
    preferences: "Preferences",
    appearance: "Appearance",
    language: "Language",
    system: "System default",
    light: "Light",
    dark: "Dark",
    korean: "한국어",
    english: "English",
    privacy: "Runs locally in your browser",
  },
  ko: {
    eyebrow: "매일 쓰는 개발 도구를 한곳에",
    title: "DevOps Toolkit",
    description: "필요한 도구를 빠르고 편하게.",
    ready: "작업 공간을 준비하고 있어요.",
    next: "첫 도구는 JSON Formatter, Unix Timestamp, UUID Generator입니다.",
    preferences: "환경 설정",
    appearance: "화면 테마",
    language: "언어",
    system: "시스템 설정 따르기",
    light: "라이트 모드",
    dark: "다크 모드",
    korean: "한국어",
    english: "English",
    privacy: "브라우저 안에서 로컬 처리",
  },
} as const;

export default function App() {
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const [systemLanguage, setSystemLanguage] = useState<"ko" | "en">(getSystemLanguage);
  const resolvedLanguage = resolveLanguage(language, systemLanguage);
  const t = messages[resolvedLanguage];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = resolvedLanguage;
  }, [theme, resolvedLanguage]);

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

  useEffect(() => {
    const updateLanguage = () => setSystemLanguage(getSystemLanguage());
    window.addEventListener("languagechange", updateLanguage);
    return () => window.removeEventListener("languagechange", updateLanguage);
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="DevOps Toolkit home">
          <span className="brand-icon"><Braces size={19} strokeWidth={2.4} /></span>
          <span>DevOps <b>Toolkit</b></span>
        </a>
        <div className="topbar-actions">
          <label className="select-control" aria-label={t.appearance}>
            {theme === "system" ? <Monitor size={15} /> : theme === "light" ? <Sun size={15} /> : <Moon size={15} />}
            <select value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)}>
              <option value="system">{t.system}</option>
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
            </select>
          </label>
          <label className="select-control" aria-label={t.language}>
            <Languages size={15} />
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguagePreference)}>
              <option value="system">{t.system}</option>
              <option value="ko">{t.korean}</option>
              <option value="en">{t.english}</option>
            </select>
          </label>
        </div>
      </header>

      <section id="home" className="welcome-card">
        <div className="welcome-orb orb-one" />
        <div className="welcome-orb orb-two" />
        <div className="welcome-content">
          <span className="eyebrow"><i />{t.eyebrow}</span>
          <h1>{t.title}<span>.</span></h1>
          <p className="lead">{t.description}</p>
          <div className="divider" />
          <p className="ready">{t.ready}</p>
          <p className="next-tools">{t.next}</p>
        </div>
        <div className="welcome-graphic" aria-hidden="true">
          <div className="graphic-ring ring-outer" />
          <div className="graphic-ring ring-inner" />
          <div className="graphic-center"><Braces size={31} /></div>
          <span className="graphic-dot dot-a" /><span className="graphic-dot dot-b" /><span className="graphic-dot dot-c" />
        </div>
      </section>

      <footer className="app-footer"><span>DEVOPS TOOLKIT <i>·</i> 0.1.0</span><span className="local-indicator"><i />{t.privacy}</span></footer>
    </main>
  );
}
