export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";
export const SKIP_BOOT_STORAGE_KEY = "skipBootSequence";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function readStoredTheme(): Theme {
  if (!hasWindow()) return "dark";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  if (!hasWindow()) return;
  document.documentElement.dataset.theme = theme;
}

export function setStoredTheme(theme: Theme) {
  if (!hasWindow()) return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

export function readSkipBootSequence(): boolean {
  if (!hasWindow()) return false;
  return window.localStorage.getItem(SKIP_BOOT_STORAGE_KEY) === "1";
}

export function setSkipBootSequence(skip: boolean) {
  if (!hasWindow()) return;
  window.localStorage.setItem(SKIP_BOOT_STORAGE_KEY, skip ? "1" : "0");
}
