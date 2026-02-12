"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type ProjectDetails = {
  url: string;
  fullName: string;
  name: string;
  description: string | null;
  primaryLanguage: string | null;
  // Can be either the new shape or an older cached response (string[])
  languages: Array<{ name: string; percent: number }> | string[];
  stars: number;
};

export default function Projects() {
  const [projects, setProjects] = useState<ProjectDetails[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const cardVariants = {
    rest: {
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "brightness(1) contrast(1)",
      transition: { type: "spring", stiffness: 520, damping: 40 },
    },
    hover: {
      y: -2,
      scale: 1.012,
      rotate: -0.2,
      filter: "brightness(1.06) contrast(1.04)",
      transition: { type: "spring", stiffness: 520, damping: 32 },
    },
  } as const;

  const sheenVariants = {
    rest: { opacity: 0, x: "-60%" },
    hover: {
      opacity: 1,
      x: "140%",
      transition: { duration: 0.55, ease: "easeOut" },
    },
  } as const;

  const scanlineVariants = {
    rest: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  } as const;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/projects", {
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Request failed (${res.status}): ${text.slice(0, 120)}`,
          );
        }

        const json = (await res.json()) as { projects: ProjectDetails[] };
        if (alive) setProjects(json.projects);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load projects");
        setProjects([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="px-6 py-24 max-w-5xl mx-auto">
      <h2 className="text-sm mb-8 opacity-60">PROJECTS</h2>

      <div className="grid gap-6">
        {!projects && !error && (
          <div className="border-glow p-4 text-xs opacity-60">Loading…</div>
        )}

        {error && (
          <div className="border-glow p-4 text-xs opacity-60">
            Failed to load projects.
          </div>
        )}

        {(projects ?? []).map((p, idx) => (
          <motion.a
            key={`${p.fullName}-${idx}`}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            variants={cardVariants}
            initial="rest"
            animate="rest"
            whileHover={reducedMotion ? { scale: 1.01 } : "hover"}
            className="border-glow bg-(--surface2) p-4 flex justify-between items-center relative overflow-hidden"
          >
            {!reducedMotion && (
              <>
                <motion.span
                  aria-hidden="true"
                  className="project-scanlines"
                  variants={scanlineVariants}
                />
                <motion.span
                  aria-hidden="true"
                  className="project-sheen"
                  variants={sheenVariants}
                />
              </>
            )}

            <div className="relative z-10 flex justify-between items-center w-full">
              <span className="opacity-60">
                #{String(idx + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1 px-4">
                <div className="text-glow truncate">{p.name}</div>
                <div className="text-xs opacity-50 truncate">{p.fullName}</div>
                {(p.languages?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
                    {p.languages
                      .map((lang) =>
                        typeof lang === "string"
                          ? {
                              name: lang,
                              percent: undefined as number | undefined,
                            }
                          : { name: lang.name, percent: lang.percent },
                      )
                      .filter((lang) => Boolean(lang.name))
                      .map((lang, langIndex) => (
                        <span
                          key={`${p.fullName}-${lang.name}-${langIndex}`}
                          className={
                            lang.name === p.primaryLanguage
                              ? "text-glow opacity-90"
                              : "opacity-55"
                          }
                        >
                          {lang.name}
                          {typeof lang.percent === "number"
                            ? ` ${lang.percent}%`
                            : ""}
                        </span>
                      ))}
                  </div>
                )}
                {p.description && (
                  <div className="text-xs opacity-60 truncate mt-1">
                    {p.description}
                  </div>
                )}
              </span>

              <span className="text-xs opacity-50 whitespace-nowrap inline-flex items-center gap-1">
                <svg
                  aria-label="stars"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                </svg>
                {p.stars}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
