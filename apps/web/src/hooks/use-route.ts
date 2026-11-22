import { useEffect, useState } from "react";

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function useRoute() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const sync = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = (href: string) => {
    const next = normalizePath(href);
    if (next === normalizePath(window.location.pathname)) return;
    window.history.pushState(null, "", next);
    setPath(next);
  };

  return { path, navigate };
}
