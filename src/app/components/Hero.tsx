"use client";
import { motion } from "framer-motion";

export default function Hero() {
  const headline = "Hey, I'm Philipp.";
  const tagline = "Welcome to my digital archive.";

  return (
    <section className="relative h-screen flex items-center justify-center noise">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="border-glow p-8 text-center"
      >
        <p className="text-xs opacity-60 mb-2">BOOT SEQUENCE COMPLETE</p>
        <h1 className="text-4xl md:text-6xl text-glow tracking-wide">
          <span className="sr-only">{headline}</span>
          <motion.span
            aria-hidden="true"
            initial="hidden"
            animate="show"
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
            <motion.span
              aria-hidden="true"
              className="inline-block w-[0.6ch] align-baseline opacity-80"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            >
              ▍
            </motion.span>
          </motion.span>
        </h1>

        <p className="mt-4 text-sm opacity-70">{tagline}</p>
        <p className="mt-1 text-xs opacity-50">status: online</p>
      </motion.div>
    </section>
  );
}
