export type ProjectConfig = {
  url: string;
  shown: boolean;
};

export type ProjectDetails = {
  url: string;
  fullName: string;
  name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  primaryLanguage: string | null;
  languages: Array<{ name: string; percent: number }>;
  stars: number;
  forks: number;
  updatedAt: string;
};

type GitHubRepoResponse = {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export function parseGitHubFullNameFromUrl(repoUrl: string): string {
  const url = new URL(repoUrl);
  if (url.hostname !== "github.com")
    throw new Error(`Not github.com: ${repoUrl}`);

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error(`Invalid repo URL: ${repoUrl}`);

  return `${parts[0]}/${parts[1]}`;
}

export async function fetchGitHubRepo(fullName: string, token?: string) {
  const res = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 60 * 60 },
  });

  if (!res.ok)
    throw new Error(`GitHub API failed for ${fullName}: ${res.status}`);
  return (await res.json()) as GitHubRepoResponse;
}

export async function fetchGitHubRepoLanguages(
  fullName: string,
  token?: string,
) {
  const res = await fetch(
    `https://api.github.com/repos/${fullName}/languages`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 60 * 60 },
    },
  );

  if (!res.ok) {
    throw new Error(
      `GitHub languages API failed for ${fullName}: ${res.status}`,
    );
  }

  return (await res.json()) as Record<string, number>;
}

function languagePercents(map: Record<string, number>) {
  const entries = Object.entries(map).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total <= 0) return [] as Array<{ name: string; percent: number }>;

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / total) * 100),
    }));
}

export async function getProjectDetails(
  cfg: ProjectConfig,
  token?: string,
): Promise<ProjectDetails> {
  const fullName = parseGitHubFullNameFromUrl(cfg.url);
  const repo = await fetchGitHubRepo(fullName, token);

  let primaryLanguage: string | null = repo.language;
  let languages: Array<{ name: string; percent: number }> = repo.language
    ? [{ name: repo.language, percent: 100 }]
    : [];

  try {
    const langMap = await fetchGitHubRepoLanguages(fullName, token);
    const withPercents = languagePercents(langMap);
    if (withPercents.length > 0) {
      languages = withPercents;
      primaryLanguage = withPercents[0].name;
    }
  } catch {
    // Fallback to repo.language only.
  }

  return {
    url: repo.html_url,
    fullName: repo.full_name,
    name: repo.name,
    description: repo.description,
    homepage: repo.homepage,
    language: repo.language,
    primaryLanguage,
    languages,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
  };
}
