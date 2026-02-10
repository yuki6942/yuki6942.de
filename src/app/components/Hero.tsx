"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { BOOT_EVENTS, hasBootRevealOrDoneFlag } from "@/lib/boot";

export default function Hero() {
  const headline = "Hey, I'm Philipp.";
  const tagline = "Welcome to my digital archive.";
  const [bootDone, setBootDone] = useState(false);
  const [introFx, setIntroFx] = useState(false);

  useEffect(() => {
    if (hasBootRevealOrDoneFlag()) {
      setBootDone(true);
      return;
    }

    const onReveal = () => setBootDone(true);
    window.addEventListener(BOOT_EVENTS.reveal, onReveal, { once: true });

    // Fallback (in case the boot overlay is removed later)
    const fallbackId = window.setTimeout(() => setBootDone(true), 6000);

    return () => {
      window.removeEventListener(BOOT_EVENTS.reveal, onReveal);
      window.clearTimeout(fallbackId);
    };
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    setIntroFx(true);
    const id = window.setTimeout(() => setIntroFx(false), 900);
    return () => window.clearTimeout(id);
  }, [bootDone]);

  return (
    <section className="relative h-screen flex items-center justify-center noise">
      <motion.div
        initial="hidden"
        animate={bootDone ? "show" : "hidden"}
        variants={{
          hidden: {
            opacity: 0,
            scale: 0.985,
            filter: "blur(2px)",
            clipPath: "inset(46% 0% 46% 0%)",
          },
          show: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            clipPath: "inset(0% 0% 0% 0%)",
            transition: { duration: 0.65, ease: "easeInOut", delay: 0.06 },
          },
        }}
        className="relative border-glow bg-(--surface2) p-8 text-center overflow-hidden"
      >
        {introFx && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute -left-12 -right-12 h-24 bg-linear-to-b from-transparent via-fuchsia-200/12 to-transparent"
              initial={{ y: "-30vh", opacity: 0 }}
              animate={{ y: "120vh", opacity: [0, 1, 0] }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 opacity-[0.04] mix-blend-screen" />
          </motion.div>
        )}

        <p className="text-xs opacity-60 mb-2">BOOT SEQUENCE COMPLETE</p>
        <motion.h1
          className="text-4xl md:text-6xl text-glow tracking-wide"
          initial={false}
          animate={
            bootDone
              ? {
                  x: [0, -2, 2, -1, 1, 0],
                  filter: [
                    "contrast(1) saturate(1)",
                    "contrast(1.15) saturate(1.25)",
                    "contrast(1) saturate(1)",
                  ],
                }
              : { x: 0, filter: "contrast(1) saturate(1)" }
          }
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <span className="sr-only">{headline}</span>
          <motion.span
            aria-hidden="true"
            initial="hidden"
            animate={bootDone ? "show" : "hidden"}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.03,
                },
              },
            }}
          >
            {headline.split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: "easeOut" },
                  },
                }}
                className={
                  char === " " ? "inline-block w-[0.35em]" : "inline-block"
                }
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>

        <p className="mt-4 text-sm opacity-70">{tagline}</p>
        <p className="mt-1 text-xs opacity-50">status: online</p>
      </motion.div>
    </section>
  );
}
