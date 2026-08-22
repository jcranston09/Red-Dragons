import { useEffect, useRef } from "react";
import {
  ENDZONE_YARDS,
  FIELD_LENGTH_YARDS,
  FIELD_WIDTH_YARDS,
} from "../utils/field.js";

/** Yards behind / ahead of the LOS to keep on screen so tokens stay large. */
const MIN_BEHIND = 6;
const MIN_AHEAD = 15;

function cameraWindow(losYard, visibleYards) {
  const minYard = -ENDZONE_YARDS;
  const maxYard = FIELD_LENGTH_YARDS - ENDZONE_YARDS;
  let behind = Math.min(MIN_BEHIND, losYard - minYard);
  let near = losYard - behind;
  let far = near + visibleYards;
  if (far > maxYard) {
    far = maxYard;
    near = far - visibleYards;
    if (near < minYard) near = minYard;
  }
  return { near, far };
}

function yardToTop(yardFromOwnGoal, fieldHeight) {
  return (1 - (ENDZONE_YARDS + yardFromOwnGoal) / FIELD_LENGTH_YARDS) * fieldHeight;
}

export default function FieldStage({ fieldRef, losYard, children }) {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const field = fieldRef.current;
    if (!stage || !field) return;

    const fit = () => {
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      if (stageW < 8 || stageH < 8) return;

      const minVisible = MIN_BEHIND + MIN_AHEAD;
      let yardPx = stageW / FIELD_WIDTH_YARDS;
      let visibleYards = stageH / yardPx;

      if (visibleYards < minVisible) {
        yardPx = stageH / minVisible;
        visibleYards = minVisible;
      }

      const fieldW = FIELD_WIDTH_YARDS * yardPx;
      const fieldH = FIELD_LENGTH_YARDS * yardPx;
      const { far } = cameraWindow(losYard, visibleYards);
      const translateX = (stageW - fieldW) / 2;
      const translateY = -yardToTop(far, fieldH);

      field.style.position = "absolute";
      field.style.left = "0px";
      field.style.top = "0px";
      field.style.width = `${Math.round(fieldW)}px`;
      field.style.height = `${Math.round(fieldH)}px`;
      field.style.maxWidth = "none";
      field.style.maxHeight = "none";
      field.style.transform = `translate(${Math.round(translateX)}px, ${Math.round(translateY)}px)`;
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
  }, [fieldRef, losYard]);

  return (
    <section ref={stageRef} className="field-stage absolute inset-0 overflow-hidden">
      {children}
    </section>
  );
}
