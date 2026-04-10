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
  const started = useRef(false);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (active && !started.current) {
      started.current = true;
      onStart?.();
      let i = 0;
      interval.current = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) clearInterval(interval.current);
      }, speed);
    }
    return () => clearInterval(interval.current);
  }, [active, text, speed, onStart]);

  const show = started.current;

  return (
    <h1
      style={{
        ...style,
        opacity: show ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {text.slice(0, count)}
      {count < text.length && show && (
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
