"use client";

import { useEffect } from "react";
import { ScrollProvider } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/hooks";
import Navigation from "./Navigation";
import Hero from "./hero/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Work from "./sections/Work";
import Certifications from "./sections/Certifications";
import CommandPalette from "./CommandPalette";
import SkillSearch from "./sections/SkillSearch";
import Experience from "./sections/Experience";
import Achievements from "./sections/Achievements";
import Contact from "./sections/Contact";

/** Adds `.is-in` to every `.rv` / `.rv-mask` the first time it scrolls into view. Animates once only. */
function useRevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv, .rv-mask"));
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  useRevealObserver();
  return (
    <ScrollProvider>
      <Navigation />
      <CommandPalette />
      <main id="top">
        <Hero />
        <SkillSearch />
        <About />
        <Skills />
        <Work />
        <Experience />
        <Certifications />
        <Achievements />
        <Contact />
      </main>
    </ScrollProvider>
  );
}
