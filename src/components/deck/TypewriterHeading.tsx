import { CSSProperties, useEffect, useRef, useState } from "react";

interface TypewriterHeadingProps {
  text: string;
  active: boolean;
  style?: CSSProperties;
  speed?: number;
  /** Called once when the first character appears */
  onStart?: () => void;
}

export default function TypewriterHeading({
  text,
  active,
  style,
  speed = 45,
  onStart,
}: TypewriterHeadingProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const startNotified = useRef(false);

  useEffect(() => {
    setCount(0);
    setHasStarted(false);
    startNotified.current = false;
  }, [text]);

  useEffect(() => {
    if (!active) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (!startNotified.current) {
      startNotified.current = true;
      onStart?.();
    }

    if (count >= text.length) return;

    const timeout = window.setTimeout(() => {
      setCount((prev) => Math.min(prev + 1, text.length));
    }, speed);

    return () => window.clearTimeout(timeout);
  }, [active, count, hasStarted, onStart, speed, text.length]);

  return (
    <h1
      style={{
        ...style,
        opacity: hasStarted ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {text.slice(0, count)}
      {count < text.length && hasStarted && (
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "0.85em",
            background: "currentColor",
            marginLeft: "2px",
            verticalAlign: "baseline",
            animation: "blink-caret 0.7s step-end infinite",
          }}
        />
      )}
    </h1>
  );
}
