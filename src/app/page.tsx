import StatusBar from "./components/StatusBar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import BootSequence from "./components/BootSequence";
import ScreenEffects from "./components/ScreenEffects";
import GridBackground from "./components/GridBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-(--bg) text-(--fg) overflow-x-hidden pb-14">
      <GridBackground />
      <BootSequence />
      <StatusBar />
      <Hero />
      <Projects />
      <ScreenEffects />
    </main>
  );
}
