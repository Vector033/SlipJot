"use client";

import { useEffect, useRef } from "react";

/**
 * The landing's scroll grammar: a route line down the page whose stop markers fill in as
 * each section arrives, like the stops on a songthaew's run. Markers are visible from the
 * start; scrolling only changes their state.
 */
export function RouteStops({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stops = root.current?.querySelectorAll<HTMLElement>("[data-stop]");
    if (!stops?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) e.target.setAttribute("data-reached", "");
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    stops.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <div ref={root} className="relative">
      <span aria-hidden className="absolute top-0 bottom-0 left-[1.1rem] w-[3px] rounded-full bg-chrome sm:left-8 lg:left-[calc(50%-37rem)]" />
      {children}
    </div>
  );
}

/** One stop on the route: a marker on the line plus the section beside it. */
export function Stop({ name, children, id }: { name: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} data-stop className="group relative py-16 pl-12 sm:py-20 sm:pl-20 lg:pl-0" aria-label={name}>
      <span
        aria-hidden
        className="absolute top-[4.6rem] left-[1.1rem] size-5 -translate-x-[8.5px] rounded-full border-[3px] border-chrome-dark bg-steel transition-[background-color,border-color,transform] duration-500 ease-out group-data-[reached]:scale-110 group-data-[reached]:border-ink group-data-[reached]:bg-plate sm:top-[5.1rem] sm:left-8 lg:left-[calc(50%-37rem)]"
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
