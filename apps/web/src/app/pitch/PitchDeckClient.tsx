"use client";

import { useEffect, useState } from "react";
import { DECK_HTML, DECK_HTML_ES } from "./pitch-deck";

const THEME_KEY = "kumply-pitch-theme";
const LANG_KEY = "kumply-pitch-lang";

type Theme = "light" | "dark";
type Lang = "en" | "es";

/**
 * Theme defaults to light and language to English regardless of system
 * preference, per the pitch's institutional-review audience. Both persist
 * to localStorage once the visitor changes them. The light/English default
 * matches what layout.tsx already renders server-side (data-theme="light"
 * on <html>, this component's initial state), so there is no flash on
 * first visit — only a returning visitor with a saved dark/es preference
 * sees a brief swap after this component mounts and reads localStorage.
 */
export function PitchDeckClient({ total }: { total: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    const storedLang = window.localStorage.getItem(LANG_KEY);
    if (storedLang === "es" || storedLang === "en") setLang(storedLang);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  }

  function toggleLang() {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  }

  const html = (lang === "es" ? DECK_HTML_ES : DECK_HTML).replace(
    "__TOTAL_ATTESTATIONS__",
    total
  );

  return (
    <>
      <div className="pitch-controls">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={lang === "es" ? "Cambiar tema" : "Toggle theme"}
          title={lang === "es" ? "Cambiar tema" : "Toggle theme"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button
          type="button"
          onClick={toggleLang}
          aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
          title={lang === "en" ? "Cambiar a español" : "Switch to English"}
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
