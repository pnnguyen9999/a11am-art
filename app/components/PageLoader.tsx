"use client";

import { useEffect, useRef, useState } from "react";

type PageLoaderProps = {
  ready: boolean;
};

const HOURS = [5, 6, 7, 8, 9, 10, 11] as const;
const MIN_VISIBLE_MS = 2500;
const HOLD_AT_DONE_MS = 1500;
const EXIT_MS = 700;
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

  return (
    <div
      className={`page-loader${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden={phase === "leaving"}
    >
      <div className="page-loader__inner">
        <div className="page-loader__time" aria-live="polite">
          <span className="page-loader__label">after</span>
          <span key={hour} className="page-loader__hour">
            {hour}
          </span>
          <span className="page-loader__suffix">:am</span>
        </div>
      </div>
    </div>
  );
}
