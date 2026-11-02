import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
export function usePageMotion(
  ref: RefObject<HTMLElement | null>,
  page: string,
  ready: boolean,
) {
  useLayoutEffect(() => {
    if (!ready || !ref.current) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          ".page-heading",
          { y: 14 },
          {
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
        gsap.fromTo(
          ".intro, .stack > section, .daily-overview, .two-column > section, .track-selector, .study-explorer, .week-days",
          { y: 22 },
          {
            y: 0,
            duration: 0.65,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
      }, ref);
      return () => context.revert();
    });
    return () => media.revert();
  }, [ref, page, ready]);
}
