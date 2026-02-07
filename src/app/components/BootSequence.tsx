"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type BootLine = {
  text: string;
  tone?: "ok" | "warn" | "info";
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const update = () => setReduced(Boolean(mq.matches));
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari fallback
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}

export default function BootSequence() {
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const [visible, setVisible] = useState(true);
  const [printedLineCount, setPrintedLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!visible) return;

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
  }, [visible]);

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
      const doneId = window.setTimeout(() => setVisible(false), 300);
      timeoutsRef.current.push(doneId);
      return;
    }

    const typeSpeedMs = 18;
    const linePauseMs = 260;

    const currentLine = lines[printedLineCount];

    if (!currentLine) {
      const doneId = window.setTimeout(() => setVisible(false), 450);
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
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-100 bg-black text-white"
          style={{ touchAction: "none" }}
          aria-busy="true"
          aria-live="polite"
        >
          <div className="absolute inset-0 noise opacity-70" />
          <div className="absolute inset-0 bg-linear-to-b from-black via-black/90 to-black" />

          <div className="relative h-full w-full flex items-center justify-center px-6">
            <div className="w-full max-w-2xl border-glow bg-black/40 backdrop-blur p-6">
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
                    <span className="text-white/85">{l.text}</span>
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
