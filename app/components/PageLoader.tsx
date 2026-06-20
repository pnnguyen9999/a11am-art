"use client";

import { useEffect, useRef, useState } from "react";

type PageLoaderProps = {
  ready: boolean;
};

const HOURS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MIN_VISIBLE_MS = 600;
const HOLD_AT_DONE_MS = 500;
const EXIT_MS = 520;
const STEP_MS = MIN_VISIBLE_MS / (HOURS.length - 1);

export default function PageLoader({ ready }: PageLoaderProps) {
  const sequenceDoneRef = useRef(false);
  const [hour, setHour] = useState<(typeof HOURS)[number]>(HOURS[0]);
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    const timers = HOURS.slice(1).map((nextHour, index) =>
      window.setTimeout(
        () => {
          setHour(nextHour);
          if (nextHour === HOURS[HOURS.length - 1]) {
            sequenceDoneRef.current = true;
          }
        },
        STEP_MS * (index + 1),
      ),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!ready || !sequenceDoneRef.current) {
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      setPhase("leaving");
    }, HOLD_AT_DONE_MS);
    const goneTimer = window.setTimeout(() => {
      setPhase("gone");
    }, HOLD_AT_DONE_MS + EXIT_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(goneTimer);
    };
  }, [ready, hour]);

  if (phase === "gone") {
    return null;
  }

  const loaderText = `after ${hour}:am`;
  const isLeaving = phase === "leaving";

  return (
    <div
      className={[
        "fixed inset-0 z-[2147483647] flex h-dvh w-screen items-center justify-center overflow-hidden bg-black [transition:opacity_700ms_ease,visibility_700ms_ease,transform_900ms_cubic-bezier(0.22,1,0.36,1)]",
        isLeaving
          ? "pointer-events-none animate-[loader-hard-reveal_520ms_steps(1,end)_forwards] transition-none"
          : "pointer-events-auto visible",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={isLeaving}
    >
      <div className="z-[1] flex translate-y-[-0.5rem] items-center justify-center">
        <div
          className={[
            "relative flex min-w-[5.3em] origin-[50%_55%] items-baseline justify-center whitespace-nowrap text-[30px] font-normal leading-none tracking-[-0.08em] text-white [perspective:600px] before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:origin-[50%_55%] before:-translate-x-1/2 before:whitespace-nowrap before:text-[#ff6a00] before:opacity-0 before:mix-blend-screen before:content-[attr(data-text)] before:[font:inherit] before:[letter-spacing:inherit] before:[line-height:inherit] after:pointer-events-none after:absolute after:left-1/2 after:top-0 after:origin-[50%_55%] after:-translate-x-1/2 after:whitespace-nowrap after:text-[#00f5ff] after:opacity-0 after:mix-blend-screen after:content-[attr(data-text)] after:[font:inherit] after:[letter-spacing:inherit] after:[line-height:inherit]",
            hour >= 8 && !isLeaving
              ? "animate-[loader-text-map_1650ms_steps(1,end)_infinite] before:animate-[loader-text-chroma-a_1650ms_steps(1,end)_infinite] after:animate-[loader-text-chroma-b_1650ms_steps(1,end)_infinite]"
              : "",
            hour >= 8 && isLeaving
              ? "animate-[loader-text-map_720ms_steps(1,end)_infinite] before:animate-[loader-text-chroma-a_720ms_steps(1,end)_infinite] after:animate-[loader-text-chroma-b_720ms_steps(1,end)_infinite]"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-text={loaderText}
          aria-live="polite"
        >
          <span className="mr-[0.18em] text-[1em] font-normal leading-none tracking-[-0.08em] text-white">
            after
          </span>
          <span
            key={hour}
            className="inline-block min-w-[1.1em] origin-[50%_55%] animate-[loader-flip_500ms_cubic-bezier(0.22,1,0.36,1)] text-right will-change-[transform,opacity]"
          >
            {hour}
          </span>
          <span className="ml-[0.04em] inline-block">:am</span>
        </div>
      </div>
    </div>
  );
}
