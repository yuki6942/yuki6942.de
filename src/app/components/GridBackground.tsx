"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const COLS = 28;
const ROWS = 16;
const DOT_BASE = 1.2; // px radius
const DOT_MAX = 2.4;
const GLOW_RADIUS = 220; // mouse influence radius in px
const DRIFT_SPEED = 0.0004; // how fast the grid subtly shifts
const FLICKER_CHANCE = 0.003; // per-dot per-frame chance of a random flicker

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouse = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouse = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    document.addEventListener("mouseleave", onLeave);

    // read CSS variable for accent colour
    const style = getComputedStyle(document.documentElement);
    const accentRaw = style.getPropertyValue("--accent").trim() || "#ff7eb3";

    const draw = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cellW = w / COLS;
      const cellH = h / ROWS;
      const drift = t * DRIFT_SPEED;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const baseX = (col + 0.5) * cellW;
          const baseY = (row + 0.5) * cellH;

          // subtle organic drift
          const ox = Math.sin(drift + col * 0.7 + row * 0.3) * 3;
          const oy = Math.cos(drift + row * 0.5 + col * 0.4) * 3;
          const x = baseX + ox;
          const y = baseY + oy;

          // distance from mouse
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / GLOW_RADIUS);

          // flicker
          const flicker = Math.random() < FLICKER_CHANCE ? 0.15 : 0;

          const radius = DOT_BASE + (DOT_MAX - DOT_BASE) * proximity;
          const alpha = 0.08 + 0.35 * proximity + flicker;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          if (proximity > 0.05) {
            // accent-tinted glow near cursor
            ctx.fillStyle = accentRaw;
            ctx.globalAlpha = alpha;
            // outer glow
            ctx.shadowColor = accentRaw;
            ctx.shadowBlur = 8 * proximity;
          } else {
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = alpha;
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    if (!reducedMotion) {
      raf = requestAnimationFrame(draw);
    } else {
      // static single frame
      draw(0);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
