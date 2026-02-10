"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
      <h2 className="text-sm mb-8 opacity-60">MODULES</h2>

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
            whileHover={{ scale: 1.01 }}
            className="border-glow p-4 flex justify-between items-center"
          >
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
                        ? { name: lang, percent: undefined as number | undefined }
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
                        {typeof lang.percent === "number" ? ` ${lang.percent}%` : ""}
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

            <span className="text-xs opacity-50 whitespace-nowrap">
              ★ {p.stars}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
