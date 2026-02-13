"use client";

import { BsGithub, BsDiscord, BsEnvelopeFill } from "react-icons/bs";
import { SiBluesky } from "react-icons/si";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!@#$%^&*_-+=<>?/\\|01";
const SCRAMBLE_INTERVAL = 55; // ms per character reveal
const SCRAMBLE_JITTER = 3; // extra random ticks before settling

function useTextScramble(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let iteration = -SCRAMBLE_JITTER; // negative = pure-scramble warm-up
    const total = text.length;

    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (iteration >= 0 && i < iteration) return char;
            return GLITCH_CHARS[
              Math.floor(Math.random() * GLITCH_CHARS.length)
            ];
          })
          .join(""),
      );
      iteration += 1;
      if (iteration > total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, SCRAMBLE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, text]);

  return display;
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function SocialIcon({ href, label, icon }: SocialLink) {
  const [hovered, setHovered] = useState(false);
  const scrambled = useTextScramble(label, hovered);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="social-icon group relative flex items-center justify-center w-9 h-9 border border-(--border) hover:border-(--accent-dim) transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* chromatic aberration layers */}
      <span
        className="social-icon-rgb absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400/50 transition-opacity duration-100"
        aria-hidden="true"
        style={{ transform: "translate(-1px, 0)" }}
      >
        {icon}
      </span>
      <span
        className="social-icon-rgb absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-cyan-400/50 transition-opacity duration-100"
        aria-hidden="true"
        style={{ transform: "translate(1px, 0)" }}
      >
        {icon}
      </span>

      {/* main icon */}
      <span className="relative z-10 transition-transform duration-100 group-hover:scale-110">
        {icon}
      </span>

      {/* tooltip */}
      <span
        className="social-tooltip pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] tracking-widest whitespace-nowrap border border-(--accent-dim) bg-(--surface2) backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150"
        aria-hidden="true"
      >
        <span className="text-glow">&gt; {scrambled}</span>
      </span>
    </a>
  );
}

const SOCIALS: SocialLink[] = [
  {
    href: "https://github.com/yuki6942",
    label: "GITHUB",
    icon: <BsGithub size={15} />,
  },
  {
    href: "https://discord.com/users/594627968668794896",
    label: "DISCORD",
    icon: <BsDiscord size={15} />,
  },
  {
    href: "https://bsky.app/profile/yuki6942.de",
    label: "BLUESKY",
    icon: <SiBluesky size={15} />,
  },
  {
    href: "mailto:contact@yuki6942.de",
    label: "EMAIL",
    icon: <BsEnvelopeFill size={15} />,
  },
];

export default function Socials() {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 mt-6"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
      }}
    >
      {SOCIALS.map((social) => (
        <motion.div
          key={social.label}
          variants={{
            hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.35, ease: "easeOut" },
            },
          }}
        >
          <SocialIcon {...social} />
        </motion.div>
      ))}
    </motion.div>
  );
}
