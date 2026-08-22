import { useEffect, useRef } from "react";
import { losYPct } from "../utils/field.js";

export default function FieldStage({ fieldRef, losYard, lockScroll, children }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const field = fieldRef.current;
    if (!stage || !field) return;

    const scrollToLos = () => {
      if (field.offsetHeight < 80) return;
      const y = (losYPct(losYard) / 100) * field.offsetHeight;
      stage.scrollTo({
        top: Math.max(0, y - stage.clientHeight * 0.68),
        left: 0,
        behavior: "auto",
      });
    };

    const frame = requestAnimationFrame(scrollToLos);
    const timer = setTimeout(scrollToLos, 120);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [fieldRef, losYard]);

  return (
    <section
      ref={stageRef}
      className={`field-stage min-h-0 flex-1 overscroll-y-contain px-2 py-2 landscape:px-2 landscape:py-1 ${
        lockScroll ? "overflow-hidden" : "overflow-auto"
      }`}
    >
      {children}
    </section>
  );
}
