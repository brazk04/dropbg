import { GITHUB_URL } from "@/lib/constants";
export function GithubLink() {
  return GITHUB_URL ? (
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
      GitHub ↗
    </a>
  ) : (
    <a href="/sobre-o-projeto">Sobre o projeto</a>
  );
}
