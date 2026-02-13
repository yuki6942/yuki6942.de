"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export default function ScreenEffects() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      {!reducedMotion && (
        <>
          <div className="flicker-overlay" aria-hidden="true" />
          <div className="scanlines" aria-hidden="true" />
        </>
      )}
    </>
  );
}
