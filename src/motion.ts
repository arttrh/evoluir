import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
export function usePageMotion(
  ref: RefObject<HTMLElement | null>,
  page: string,
  ready: boolean,
) {
  useLayoutEffect(() => {
    const main = ref.current;
    if (!ready || !main) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Superfícies com backdrop-filter ficam paradas para evitar recomposição pesada no iPhone.
      const targets = Array.from(
        main.querySelectorAll(".page-heading, .intro, .section-heading"),
      )
        .filter((n) => !n.closest(".glass"))
        .slice(0, 6);
      const context = gsap.context(() => {
        gsap.fromTo(
          targets,
          { y: 8 },
          {
            y: 0,
            duration: 0.32,
            stagger: 0.025,
            ease: "power2.out",
            overwrite: "auto",
            clearProps: "transform",
          },
        );
      }, main);
      return () => context.revert();
    });
    return () => media.revert();
  }, [ref, page, ready]);
}
