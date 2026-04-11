import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { t } from "@/lib/theme";
import { caseStudyUi as ui } from "./caseStudyUi";

const f = { sans: t.sans, ink: t.ink };

export type CasePhase = {
  title: string;
  date?: string;
  description: string;
  stats?: { value: string; label: string }[];
};

export type CaseStudyData = {
  id: string;
  name: string;
  issue: string;
  outcome: string;
  phases: CasePhase[] | null;
};

interface Props {
  study: CaseStudyData | null;
  onClose: () => void;
}

const CaseTimelineOverlay: React.FC<Props> = ({ study, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !study?.phases?.length) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-phase]"));
    if (!nodes.length) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    nodes.forEach((node, i) => {
      const dist = Math.abs(node.offsetLeft + node.offsetWidth / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActivePhase(closest);
  }, [study]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !study) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", handleScroll, { passive: true });
    requestAnimationFrame(handleScroll);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, handleWheel, study]);

  useEffect(() => {
    if (!study) return;
    setActivePhase(0);

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [study, onClose]);

  if (!study) return null;

  const phases = study.phases ?? [];
  const hasPhases = phases.length > 0;
  const totalPhases = phases.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: "hsl(var(--background))",
        animation: "fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Minimal header: close + title only ── */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-8 py-5 md:px-12"
      >
        <h2
          style={{
            fontFamily: f.sans,
            fontSize: "clamp(15px, 1.4vw, 18px)",
            fontWeight: 600,
            color: f.ink(0.6),
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: f.ink(0.3) }}>Case Study</span>
          <span style={{ color: f.ink(0.15), margin: "0 8px" }}>/</span>
          {study.name}
        </h2>

        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: "36px",
            height: "36px",
            border: ui.cardBorder,
            color: f.ink(0.35),
            background: "transparent",
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {hasPhases ? (
        <div className="relative flex-1 overflow-hidden">
          {/* Edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10"
            style={{
              width: "clamp(40px, 6vw, 100px)",
              background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10"
            style={{
              width: "clamp(40px, 6vw, 100px)",
              background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)",
            }}
          />

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x proximity",
            }}
          >
            <style>{`.tl-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div
              className="tl-scroll flex h-full items-center"
              style={{
                minWidth: "max-content",
                paddingLeft: "clamp(60px, 8vw, 160px)",
                paddingRight: "clamp(120px, 14vw, 280px)",
              }}
            >
              {phases.map((phase, i) => {
                const isActive = activePhase === i;
                const isLast = i === totalPhases - 1;
                const hasStats = (phase.stats?.length ?? 0) > 0;

                return (
                  <div
                    key={i}
                    data-phase
                    className="flex h-full flex-shrink-0 flex-col"
                    style={{
                      width: "clamp(300px, 22vw, 360px)",
                      scrollSnapAlign: "center",
                    }}
                  >
                    {/* ── Top half: date + phase number ── */}
                    <div
                      className="flex flex-1 flex-col justify-end"
                      style={{
                        paddingRight: "clamp(20px, 2vw, 32px)",
                        paddingBottom: "28px",
                      }}
                    >
                      {phase.date && (
                        <span
                          style={{
                            ...ui.meta,
                            marginBottom: "8px",
                            opacity: isActive ? 1 : 0.5,
                            transition: "opacity 0.3s ease",
                          }}
                        >
                          {phase.date}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(56px, 6vw, 80px)",
                          fontWeight: 800,
                          color: f.ink(isActive ? 0.08 : 0.04),
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* ── Rail ── */}
                    <div
                      className="flex flex-shrink-0 items-center"
                      style={{
                        height: "1px",
                        paddingRight: "clamp(20px, 2vw, 32px)",
                        position: "relative",
                      }}
                    >
                      {/* Node */}
                      <div
                        style={{
                          width: isActive ? "12px" : "8px",
                          height: isActive ? "12px" : "8px",
                          borderRadius: "999px",
                          background: isActive ? f.ink(0.5) : f.ink(0.14),
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                          position: "relative",
                          zIndex: 2,
                        }}
                      />
                      {/* Connecting line */}
                      {!isLast && (
                        <div
                          className="flex-1"
                          style={{
                            height: "1px",
                            background: activePhase > i
                              ? f.ink(0.2)
                              : f.ink(0.06),
                            transition: "background 0.3s ease",
                          }}
                        />
                      )}
                    </div>

                    {/* ── Bottom half: title + description ── */}
                    <div
                      className="flex flex-1 flex-col justify-start"
                      style={{
                        paddingRight: "clamp(20px, 2vw, 32px)",
                        paddingTop: "28px",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(17px, 1.6vw, 21px)",
                          fontWeight: 700,
                          color: f.ink(isActive ? 0.84 : 0.5),
                          lineHeight: 1.25,
                          letterSpacing: "-0.02em",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {phase.title}
                      </h3>

                      <p
                        style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(13px, 1.1vw, 15px)",
                          color: f.ink(isActive ? 0.42 : 0.25),
                          lineHeight: 1.65,
                          marginTop: "10px",
                          maxWidth: "300px",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {phase.description}
                      </p>

                      {hasStats && (
                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                          {phase.stats!.map((stat, si) => (
                            <div key={si}>
                              <div
                                style={{
                                  fontFamily: f.sans,
                                  fontSize: "clamp(18px, 1.8vw, 24px)",
                                  fontWeight: 700,
                                  color: f.ink(isActive ? 0.84 : 0.4),
                                  letterSpacing: "-0.02em",
                                  lineHeight: 1,
                                  transition: "color 0.3s ease",
                                }}
                              >
                                {stat.value}
                              </div>
                              <div
                                style={{
                                  ...ui.meta,
                                  marginTop: "4px",
                                  opacity: isActive ? 1 : 0.5,
                                  transition: "opacity 0.3s ease",
                                }}
                              >
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* No timeline state */
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="max-w-md text-center">
            <p
              style={{
                fontFamily: f.sans,
                fontSize: "clamp(14px, 1.3vw, 16px)",
                color: f.ink(0.38),
                lineHeight: 1.7,
              }}
            >
              {study.outcome}
            </p>
            <p style={{ ...ui.smallMeta, marginTop: "20px" }}>
              Timeline coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseTimelineOverlay;
