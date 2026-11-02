import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
export function usePageMotion(
  ref: RefObject<HTMLElement | null>,
  page: string,
  ready: boolean,
  date: string,
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
        if (page === "Semana") {
          gsap.fromTo(
            main.querySelectorAll(".week-days > button"),
            { y: 7, scale: 0.96 },
            {
              y: 0,
              scale: 1,
              duration: 0.3,
              stagger: 0.025,
              ease: "power2.out",
              clearProps: "transform",
            },
          );
          const content = main.querySelector(
            ".week-days + .two-column > .stack > section",
          );
          if (content)
            gsap.fromTo(
              content,
              { x: 12 },
              {
                x: 0,
                duration: 0.3,
                ease: "power2.out",
                clearProps: "transform",
              },
            );
        }
      }, main);
      return () => context.revert();
    });
    return () => media.revert();
  }, [ref, page, ready, date]);
}
