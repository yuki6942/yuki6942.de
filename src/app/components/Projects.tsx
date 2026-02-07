"use client";
import { motion } from "framer-motion";

const projects = [
  { id: "01", title: "IDENTITY_SPLIT" },
  { id: "02", title: "GLITCH_ARCHIVE" },
  { id: "03", title: "NEON_TRACE" },
];

export default function Projects() {
  return (
    <section className="px-6 py-24 max-w-5xl mx-auto">
      <h2 className="text-sm mb-8 opacity-60">MODULES</h2>

      <div className="grid gap-6">
        {projects.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.01 }}
            className="border-glow p-4 flex justify-between items-center"
          >
            <span className="opacity-60">#{p.id}</span>
            <span className="text-glow">{p.title}</span>
            <span className="text-xs opacity-40">view</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
