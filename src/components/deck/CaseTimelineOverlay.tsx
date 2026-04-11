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
  const [scrollProgress, setScrollProgress] = useState(0);
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

    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);

    const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-phase-panel]"));
    if (!panels.length) return;

    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let nextActive = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    panels.forEach((panel, index) => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const distance = Math.abs(panelCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        nextActive = index;
      }
    });

    setActivePhase(nextActive);
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

    setScrollProgress(0);
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
        animation: "fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex flex-shrink-0 items-start justify-between gap-6 px-8 py-6 md:px-14">
        <div className="flex items-start gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: "40px",
              height: "40px",
              border: ui.cardBorder,
              color: ui.nodeActive,
              background: "transparent",
            }}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <span style={ui.meta}>Case study</span>
              {hasPhases && <span style={ui.meta}>{totalPhases} phases</span>}
            </div>
            <h2
              style={{
                ...ui.title,
                fontSize: "clamp(20px, 2vw, 28px)",
              }}
            >
              {study.name}
            </h2>
          </div>
        </div>

        {hasPhases && (
          <div className="hidden md:flex items-center gap-4">
            <span style={ui.smallMeta}>
              {String(activePhase + 1).padStart(2, "0")} / {String(totalPhases).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-8 pb-6 md:px-14">
        <p style={{ ...ui.body, maxWidth: "720px" }}>{study.issue}</p>
      </div>

      {hasPhases ? (
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`[data-phase-scroll]::-webkit-scrollbar { display: none; }`}</style>
            <div
              data-phase-scroll
              className="flex h-full"
              style={{
                minWidth: "max-content",
                paddingLeft: "clamp(40px, 6vw, 120px)",
                paddingRight: "clamp(100px, 12vw, 220px)",
              }}
            >
              {phases.map((phase, index) => {
                const hasStats = (phase.stats?.length ?? 0) > 0;
                const isActive = activePhase === index;
                const isLast = index === totalPhases - 1;

                return (
                  <div
                    key={index}
                    data-phase-panel
                    className="flex h-full flex-shrink-0 flex-col"
                    style={{ width: "clamp(320px, 24vw, 380px)" }}
                  >
                    <div
                      className="flex flex-1 items-end"
                      style={{ paddingRight: "clamp(24px, 2vw, 32px)", paddingTop: "24px" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          borderRadius: ui.radius,
                          border: isActive ? ui.cardBorderStrong : ui.cardBorder,
                          background: ui.cardSurface,
                          padding: "24px 24px 22px",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <span style={ui.meta}>{String(index + 1).padStart(2, "0")}</span>
                          {phase.date ? <span style={ui.meta}>{phase.date}</span> : null}
                        </div>

                        <h3
                          style={{
                            ...ui.title,
                            fontSize: "clamp(18px, 1.8vw, 22px)",
                          }}
                        >
                          {phase.title}
                        </h3>

                        <p style={{ ...ui.body, marginTop: "12px" }}>{phase.description}</p>

                        {hasStats && (
                          <div className="mt-6 flex flex-wrap gap-3">
                            {phase.stats!.map((stat, statIndex) => (
                              <div
                                key={statIndex}
                                style={{
                                  minWidth: "120px",
                                  borderRadius: "14px",
                                  border: ui.cardBorder,
                                  background: "transparent",
                                  padding: "14px 14px 12px",
                                }}
                              >
                                <div style={ui.statValue}>{stat.value}</div>
                                <div style={{ ...ui.meta, marginTop: "6px" }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex flex-shrink-0 items-center"
                      style={{ height: "64px", paddingRight: "clamp(24px, 2vw, 32px)" }}
                    >
                      <div
                        style={{
                          width: isActive ? "10px" : "8px",
                          height: isActive ? "10px" : "8px",
                          borderRadius: "999px",
                          background: isActive ? ui.nodeActive : ui.node,
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                      />
                      {!isLast && (
                        <div
                          className="flex-1"
                          style={{
                            height: "1px",
                            background: activePhase > index ? ui.railActive : ui.rail,
                            transition: "background 0.2s ease",
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-6 right-8 md:right-14"
            style={{ opacity: scrollProgress < 0.06 ? 0.45 : 0, transition: "opacity 0.2s ease" }}
          >
            <span
              style={{
                fontFamily: f.sans,
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: f.ink(0.22),
              }}
            >
              Scroll
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="max-w-xl text-center">
            <p style={{ ...ui.body, fontSize: "clamp(15px, 1.4vw, 17px)" }}>{study.outcome}</p>
            <p style={{ ...ui.smallMeta, marginTop: "24px" }}>Timeline coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseTimelineOverlay;
