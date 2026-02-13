"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { markBootDone, markBootReveal } from "@/lib/hooks/boot";
import { readSkipBootSequence } from "@/lib/prefs";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type BootLine = {
  text: string;
  tone?: "ok" | "warn" | "info";
};

export default function BootSequence() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [hydrated, setHydrated] = useState(false);

  const lines: BootLine[] = useMemo(
    () => [
      { text: "BOOT SEQUENCE INIT", tone: "info" },
      { text: "Loading UI modules…", tone: "info" },
      { text: "Mounting interface…", tone: "info" },
      { text: "Linking projects index…", tone: "info" },
      { text: "Establishing secure channel…", tone: "ok" },
      { text: "BOOT SEQUENCE COMPLETE", tone: "ok" },
    ],
    [],
  );

  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [printedLineCount, setPrintedLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const timeoutsRef = useRef<number[]>([]);
  const didSignalDoneRef = useRef(false);
  const didSignalRevealRef = useRef(false);

  const signalReveal = () => {
    if (didSignalRevealRef.current) return;
    didSignalRevealRef.current = true;
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // ignore
    }
    markBootReveal();
  };

  const signalDone = () => {
    if (didSignalDoneRef.current) return;
    didSignalDoneRef.current = true;
    markBootDone();
    setLocked(false);
  };

  const beginExit = () => {
    signalReveal();
    setVisible(false);
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // Avoid the browser restoring a previous scroll position on refresh.
    const prevScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const skip = readSkipBootSequence();

    if (skip) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        // ignore
      }
      markBootReveal();
      markBootDone();
      setLocked(false);
      setVisible(false);
      window.history.scrollRestoration = prevScrollRestoration;
      return;
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // ignore
    }
    setPrintedLineCount(0);
    setCharCount(0);
    setLocked(true);
    setVisible(true);

    return () => {
      window.history.scrollRestoration = prevScrollRestoration;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [locked]);

  useEffect(() => {
    return () => {
      for (const id of timeoutsRef.current) window.clearTimeout(id);
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (prefersReducedMotion) {
      setPrintedLineCount(lines.length);
      setCharCount(lines[lines.length - 1]?.text.length ?? 0);
      const doneId = window.setTimeout(beginExit, 200);
      timeoutsRef.current.push(doneId);
      return;
    }

    const typeSpeedMs = 18;
    const linePauseMs = 260;

    const currentLine = lines[printedLineCount];

    if (!currentLine) {
      const doneId = window.setTimeout(beginExit, 250);
      timeoutsRef.current.push(doneId);
      return;
    }

    if (charCount < currentLine.text.length) {
      const id = window.setTimeout(
        () => setCharCount((c) => c + 1),
        typeSpeedMs,
      );
      timeoutsRef.current.push(id);
      return;
    }

    const nextId = window.setTimeout(() => {
      setPrintedLineCount((n) => n + 1);
      setCharCount(0);
    }, linePauseMs);
    timeoutsRef.current.push(nextId);
  }, [visible, prefersReducedMotion, printedLineCount, charCount, lines]);

  const renderedLines = useMemo(() => {
    const output: Array<{ key: string; text: string; tone: BootLine["tone"] }> =
      [];

    for (let i = 0; i < printedLineCount; i++) {
      output.push({
        key: `line-${i}`,
        text: lines[i].text,
        tone: lines[i].tone,
      });
    }

    const current = lines[printedLineCount];
    if (current) {
      output.push({
        key: `line-${printedLineCount}`,
        text: current.text.slice(0, charCount),
        tone: current.tone,
      });
    }

    return output;
  }, [printedLineCount, charCount, lines]);

  return (
    <AnimatePresence onExitComplete={signalDone}>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-100 bg-transparent text-(--fg)"
          style={{ touchAction: "none" }}
          aria-busy="true"
          aria-live="polite"
        >
          <motion.div
            className="absolute inset-0 bg-(--bg)"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 noise opacity-70"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 bg-linear-to-b from-(--bg) via-(--bg) to-(--bg)"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />

          <div className="relative h-full w-full flex items-center justify-center px-6">
            <motion.div
              className="w-full max-w-2xl border-glow bg-(--surface2) backdrop-blur p-6"
              initial={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                clipPath: "inset(0% 0% 0% 0%)",
              }}
              exit={{
                opacity: 0.9,
                scale: 0.985,
                filter: "blur(2px)",
                clipPath: "inset(46% 0% 46% 0%)",
              }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              <div className="text-[11px] tracking-wider opacity-60">
                SYSTEM://INIT
              </div>

              <div className="mt-4 font-mono text-sm leading-6">
                {renderedLines.map((l) => (
                  <div key={l.key} className="flex gap-3">
                    <span
                      className={
                        l.tone === "ok"
                          ? "opacity-70 text-emerald-300"
                          : l.tone === "warn"
                            ? "opacity-70 text-amber-300"
                            : "opacity-70 text-fuchsia-200"
                      }
                    >
                      {l.tone === "ok"
                        ? "[ OK ]"
                        : l.tone === "warn"
                          ? "[ !! ]"
                          : "[ .. ]"}
                    </span>
                    <span className="opacity-85">{l.text}</span>
                  </div>
                ))}

                {!prefersReducedMotion && visible && (
                  <div className="mt-2">
                    <motion.span
                      className="inline-block w-[0.6ch] opacity-80"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      aria-hidden="true"
                    >
                      ▍
                    </motion.span>
                  </div>
                )}
              </div>

              <div className="mt-5 h-0.5 w-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-white/40"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${Math.min(100, Math.round((printedLineCount / lines.length) * 100))}%`,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
