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
      transition: { type: "spring", stiffness: 500, damping: 38 },
    },
    hover: {
      y: -3,
      scale: 1.005,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  } as const;

  const edgeVariants = {
    rest: { scaleY: 0, opacity: 0 },
    hover: {
      scaleY: 1,
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" },
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
      <div className="flex items-center gap-3 mb-8">
        <span className="led led-pink" style={{ animationDelay: "0.5s" }} />
        <h2 className="text-sm opacity-60 tracking-widest">PROJECTS</h2>
        <div
          className="flex-1 h-px opacity-30"
          style={{
            background:
              "linear-gradient(90deg, var(--accent-dim), transparent)",
          }}
        />
      </div>

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
            className="project-card bg-(--surface2) p-4 flex justify-between items-center relative overflow-hidden"
          >
            {!reducedMotion && (
              <motion.span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-0.5 origin-top"
                style={{ background: "var(--accent)" }}
                variants={edgeVariants}
              />
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
