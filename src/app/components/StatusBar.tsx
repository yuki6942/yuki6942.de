"use client";

import { BsGearFill } from "react-icons/bs";
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
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-(--border) bg-(--surface) backdrop-blur-md px-4 py-2 flex justify-between items-center text-xs">
      <div className="flex items-center gap-4 opacity-70">
        <span className="flex items-center gap-1.5">
          <span className="led led-green" />
          SYS:OK
        </span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span className="hidden sm:inline">v0.1.0</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:flex items-center gap-1.5 opacity-50">
          <span className="led led-pink" style={{ animationDelay: "0.8s" }} />
          UPLINK
        </span>

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5"
            aria-label="Settings"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <BsGearFill size={13} />
            <span className="hidden sm:inline">CFG</span>
          </button>

          {open && (
            <div className="absolute bottom-full right-0 mb-3 w-64 border-glow bg-(--surface2) backdrop-blur-md p-4">
              <div className="text-[11px] tracking-widest opacity-60 flex items-center gap-2">
                <span
                  className="led led-amber"
                  style={{ animationDelay: "1.2s" }}
                />
                SETTINGS
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-between text-left opacity-80 hover:opacity-100 transition-opacity"
                >
                  <span>Theme</span>
                  <span className="text-glow text-[11px] tracking-wider">
                    {theme === "dark" ? "DARK" : "LIGHT"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleSkipBoot}
                  className="flex items-center justify-between text-left opacity-80 hover:opacity-100 transition-opacity"
                >
                  <span>Skip boot sequence</span>
                  <span
                    className={`text-[11px] tracking-wider ${skipBoot ? "text-glow" : "opacity-50"}`}
                  >
                    {skipBoot ? "ON" : "OFF"}
                  </span>
                </button>

                <div className="h-px w-full bg-white/5 mt-1" />

                <div className="text-[10px] opacity-40">
                  Boot setting applies on refresh.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
