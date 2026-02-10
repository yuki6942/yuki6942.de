import { NextResponse } from "next/server";

import projects from "@/data/projects.json";
import type { ProjectConfig } from "@/lib/github";
import { getProjectDetails } from "@/lib/github";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  const config = (projects as ProjectConfig[]).filter((p) => p.shown);

  const results = await Promise.allSettled(
    config.map((p) => getProjectDetails(p, token)),
  );

  const data = results.flatMap((r) =>
    r.status === "fulfilled" ? [r.value] : [],
  );

  const cacheControl =
    process.env.NODE_ENV === "development"
      ? "no-store"
      : "s-maxage=3600, stale-while-revalidate=86400";

  return NextResponse.json(
    { projects: data },
    {
      headers: {
        "Cache-Control": cacheControl,
      },
    },
  );
}
