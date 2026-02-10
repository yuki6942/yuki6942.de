import StatusBar from "./components/StatusBar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import BootSequence from "./components/BootSequence";

export default function Home() {
  return (
    <main className="min-h-screen bg-(--bg) text-(--fg) overflow-x-hidden pb-14">
      <BootSequence />
      <StatusBar />
      <Hero />
      <Projects />
    </main>
  );
}
