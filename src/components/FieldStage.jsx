import { useEffect, useRef } from "react";

const FIELD_ASPECT = 30 / 53;

export default function FieldStage({ fieldRef, children }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const field = fieldRef.current;
    if (!stage || !field) return;

    const fit = () => {
      const pad = 8;
      const availableW = Math.max(0, stage.clientWidth - pad);
      const availableH = Math.max(0, stage.clientHeight - pad);
      if (availableW < 2 || availableH < 2) return;

      let width = availableW;
      let height = width / FIELD_ASPECT;
      if (height > availableH) {
        height = availableH;
        width = height * FIELD_ASPECT;
      }

      field.style.width = `${Math.floor(width)}px`;
      field.style.height = `${Math.floor(height)}px`;
      field.style.maxWidth = "none";
      field.style.maxHeight = "none";
    };

    fit();
    const frame = requestAnimationFrame(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    window.addEventListener("orientationchange", fit);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("orientationchange", fit);
    };
  }, [fieldRef]);

  return (
    <section
      ref={stageRef}
      className="field-stage flex min-h-0 flex-1 items-center justify-center overflow-hidden px-1 py-1"
    >
      {children}
    </section>
  );
}
