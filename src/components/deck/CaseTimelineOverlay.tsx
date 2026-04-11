import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronRight } from "lucide-react";
import { t } from "@/lib/theme";

const f = { sans: t.sans, ink: t.ink, cream: t.cream };

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
  const [visiblePhases, setVisiblePhases] = useState<Set<number>>(new Set());
  const [lineProgress, setLineProgress] = useState(0);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset state when study changes
  useEffect(() => {
    if (study) {
      setVisiblePhases(new Set());
      setLineProgress(0);
      // Stagger phase reveals
      if (study.phases) {
        study.phases.forEach((_, i) => {
          setTimeout(() => {
            setVisiblePhases(prev => new Set([...prev, i]));
            setLineProgress((i + 1) / (study.phases!.length));
          }, 400 + i * 200);
        });
      }
    }
  }, [study]);

  // Map vertical scroll to horizontal scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !study) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, study]);

  // Escape key
  useEffect(() => {
    if (!study) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [study, onClose]);

  if (!study) return null;

  const hasPhases = study.phases && study.phases.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: "hsl(var(--background) / 0.97)",
        backdropFilter: "blur(20px)",
        animation: "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-10 py-5 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <p
            style={{
              fontFamily: f.sans,
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: f.ink(0.3),
            }}
          >
            Case Study
          </p>
          <h2
            style={{
              fontFamily: f.sans,
              fontSize: "clamp(20px, 2.5vw, 32px)",
              fontWeight: 700,
              color: f.ink(0.9),
              letterSpacing: "-0.02em",
            }}
          >
            {study.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full transition-all"
          style={{
            border: `1px solid ${f.ink(0.08)}`,
            color: f.ink(0.4),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = f.ink(0.05);
            e.currentTarget.style.color = f.ink(0.8);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = f.ink(0.4);
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content area */}
      {hasPhases ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scroll hint */}
          <div className="flex items-center gap-2 px-6 md:px-10 pb-4">
            <p style={{ fontFamily: f.sans, fontSize: "12px", color: f.ink(0.25) }}>
              {study.issue}
            </p>
            <ChevronRight className="w-3 h-3 animate-pulse" style={{ color: f.ink(0.2) }} />
            <p style={{ fontFamily: f.sans, fontSize: "12px", color: f.ink(0.25) }}>
              Scroll to explore the timeline
            </p>
          </div>

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            <div
              className="flex items-stretch h-full"
              style={{
                minWidth: "max-content",
                paddingLeft: "clamp(24px, 5vw, 80px)",
                paddingRight: "clamp(80px, 10vw, 200px)",
              }}
            >
              {study.phases!.map((phase, i) => {
                const isVisible = visiblePhases.has(i);
                const isLast = i === study.phases!.length - 1;
                const hasStats = phase.stats && phase.stats.length > 0;

                return (
                  <div
                    key={i}
                    ref={(el) => { phaseRefs.current[i] = el; }}
                    className="flex flex-col relative"
                    style={{
                      width: hasStats ? "clamp(360px, 28vw, 440px)" : "clamp(300px, 22vw, 380px)",
                      flexShrink: 0,
                      paddingRight: "clamp(20px, 2vw, 40px)",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateX(0)" : "translateX(30px)",
                      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms`,
                    }}
                  >
                    {/* Timeline line and node */}
                    <div className="flex items-center gap-0 mb-8 mt-auto" style={{ paddingTop: "clamp(20px, 4vh, 60px)" }}>
                      {/* Node */}
                      <div
                        className="relative flex-shrink-0"
                        style={{
                          width: isLast ? "16px" : "10px",
                          height: isLast ? "16px" : "10px",
                          borderRadius: "50%",
                          background: isVisible
                            ? isLast
                              ? f.ink(0.8)
                              : f.ink(0.35)
                            : f.ink(0.08),
                          transition: "all 0.6s ease",
                          boxShadow: isLast && isVisible ? `0 0 20px ${f.ink(0.2)}` : "none",
                        }}
                      >
                        {isLast && isVisible && (
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              animation: "breathe 3s ease-in-out infinite",
                              background: f.ink(0.3),
                            }}
                          />
                        )}
                      </div>
                      {/* Line segment */}
                      {!isLast && (
                        <div
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to right, ${f.ink(isVisible ? 0.15 : 0.04)}, ${f.ink(visiblePhases.has(i + 1) ? 0.15 : 0.04)})`,
                            transition: "background 0.8s ease",
                          }}
                        />
                      )}
                    </div>

                    {/* Phase card */}
                    <div className="flex flex-col gap-3 pb-8">
                      {/* Date */}
                      {phase.date && (
                        <p
                          style={{
                            fontFamily: f.sans,
                            fontSize: "11px",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            color: f.ink(0.3),
                          }}
                        >
                          {phase.date}
                        </p>
                      )}

                      {/* Title */}
                      <h3
                        style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(17px, 1.8vw, 22px)",
                          fontWeight: 700,
                          color: f.ink(0.85),
                          lineHeight: 1.3,
                        }}
                      >
                        {phase.title}
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(13px, 1.3vw, 15px)",
                          color: f.ink(0.5),
                          lineHeight: 1.8,
                        }}
                      >
                        {phase.description}
                      </p>

                      {/* Stats */}
                      {hasStats && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {phase.stats!.map((stat, si) => (
                            <div
                              key={si}
                              className="flex flex-col px-4 py-3 rounded-lg"
                              style={{
                                background: "hsl(var(--foreground))",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: f.sans,
                                  fontSize: "clamp(16px, 1.8vw, 22px)",
                                  fontWeight: 700,
                                  color: "hsl(var(--primary-foreground))",
                                }}
                              >
                                {stat.value}
                              </span>
                              <span
                                style={{
                                  fontFamily: f.sans,
                                  fontSize: "9px",
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  marginTop: "3px",
                                  color: "hsl(var(--primary-foreground) / 0.65)",
                                }}
                              >
                                {stat.label}
                              </span>
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
        /* Coming soon state */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="text-center max-w-md">
            <p
              style={{
                fontFamily: f.sans,
                fontSize: "clamp(14px, 1.5vw, 18px)",
                color: f.ink(0.45),
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              {study.issue}
            </p>
            <div
              className="inline-block px-4 py-2 rounded-full"
              style={{
                background: f.ink(0.04),
                border: `1px solid ${f.ink(0.08)}`,
              }}
            >
              <p
                style={{
                  fontFamily: f.sans,
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: f.ink(0.35),
                }}
              >
                {study.outcome}
              </p>
            </div>
            <p
              style={{
                fontFamily: f.sans,
                fontSize: "14px",
                color: f.ink(0.25),
                marginTop: "32px",
              }}
            >
              Full timeline coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseTimelineOverlay;
