import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const update = () => setReduced(Boolean(mq.matches));
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari fallback
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}
