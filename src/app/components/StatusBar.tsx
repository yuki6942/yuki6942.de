"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  applyTheme,
  readSkipBootSequence,
  readStoredTheme,
  setSkipBootSequence,
  setStoredTheme,
  type Theme,
} from "@/lib/prefs";

export default function StatusBar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [skipBoot, setSkipBoot] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = readStoredTheme();
    const savedSkip = readSkipBootSequence();
    setTheme(savedTheme);
    setSkipBoot(savedSkip);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!popoverRef.current) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (!popoverRef.current.contains(target)) setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
  };

  const toggleSkipBoot = () => {
    const next = !skipBoot;
    setSkipBoot(next);
    setSkipBootSequence(next);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-(--border) bg-(--surface) backdrop-blur px-4 py-2 flex justify-between items-center text-xs opacity-80">
      <span>version 0.1.0</span>

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          className="opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Settings"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Settings size={16} strokeWidth={1.5} />
        </button>

        {open && (
          <div className="absolute bottom-full right-0 mb-3 w-64 border-glow bg-(--surface2) backdrop-blur p-3">
            <div className="text-[11px] tracking-wider opacity-70">
              SETTINGS
            </div>

            <div className="mt-3 grid gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between text-left opacity-90 hover:opacity-100"
              >
                <span>Theme</span>
                <span className="text-glow">
                  {theme === "dark" ? "DARK" : "LIGHT"}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleSkipBoot}
                className="flex items-center justify-between text-left opacity-90 hover:opacity-100"
              >
                <span>Skip boot sequence</span>
                <span className={skipBoot ? "text-glow" : "opacity-70"}>
                  {skipBoot ? "ON" : "OFF"}
                </span>
              </button>

              <div className="text-[11px] opacity-55">
                Boot setting applies on refresh.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
