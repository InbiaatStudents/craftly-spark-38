import { useEffect, useRef } from "react";
import anime from "animejs";

export default function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const shapes = containerRef.current.querySelectorAll(".floating-shape");
    anime({
      targets: shapes,
      translateY: () => anime.random(-30, 30),
      translateX: () => anime.random(-20, 20),
      rotate: () => anime.random(-15, 15),
      scale: () => [0.9, 1.1],
      duration: () => anime.random(3000, 5000),
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
      delay: anime.stagger(400),
    });
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="floating-shape absolute top-[10%] left-[5%] h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="floating-shape absolute top-[60%] right-[10%] h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
      <div className="floating-shape absolute top-[30%] right-[25%] h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />
      <div className="floating-shape absolute bottom-[15%] left-[20%] h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}
