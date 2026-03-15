import { gsap } from "gsap";

export async function transitionView(main, renderView) {
  if (!main) return renderView();

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    main.innerHTML = "";
    return renderView();
  }

  // Clear existing view first.
  main.innerHTML = "";

  // Prepare entrance animation state.
  gsap.killTweensOf(main);
  gsap.set(main, { opacity: 0, y: 10 });

  const cleanup = await renderView();

  gsap.to(main, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    ease: "power2.inOut",
    overwrite: true,
  });

  return cleanup;
}
