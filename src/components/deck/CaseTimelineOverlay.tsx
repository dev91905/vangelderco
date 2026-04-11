import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);

  // Reset state when study changes
  useEffect(() => {
    if (study) {
      setVisiblePhases(new Set());
      setScrollProgress(0);
      setActivePhase(0);
      if (study.phases) {
        study.phases.forEach((_, i) => {
          setTimeout(() => {
            setVisiblePhases(prev => new Set([...prev, i]));
          }, 300 + i * 150);
        });
      }
    }
  }, [study]);

  // Map vertical scroll to horizontal scroll + track progress
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !study?.phases) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const progress = el.scrollLeft / maxScroll;
    setScrollProgress(progress);
    const phaseIdx = Math.min(
      Math.floor(progress * study.phases.length),
      study.phases.length - 1
    );
    setActivePhase(phaseIdx);
  }, [study]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !study) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleWheel, handleScroll, study]);

  // Escape key
  useEffect(() => {
    if (!study) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [study, onClose]);

  if (!study) return null;

  const hasPhases = study.phases && study.phases.length > 0;
  const totalPhases = study.phases?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: "hsl(var(--background))",
        animation: "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 md:px-14 py-6 flex-shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: "40px",
              height: "40px",
              border: `1px solid ${f.ink(0.08)}`,
              color: f.ink(0.35),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = f.ink(0.05);
              e.currentTarget.style.color = f.ink(0.7);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = f.ink(0.35);
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <p style={{
              fontFamily: f.sans,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: f.ink(0.25),
              marginBottom: "4px",
            }}>
              Case Study
            </p>
            <h2 style={{
              fontFamily: f.sans,
              fontSize: "clamp(18px, 2vw, 26px)",
              fontWeight: 700,
              color: f.ink(0.85),
              letterSpacing: "-0.025em",
            }}>
              {study.name}
            </h2>
          </div>
        </div>

        {/* Phase counter */}
        {hasPhases && (
          <div className="hidden md:flex items-center gap-4">
            <span style={{
              fontFamily: f.sans,
              fontSize: "11px",
              color: f.ink(0.25),
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}>
              {String(activePhase + 1).padStart(2, "0")} / {String(totalPhases).padStart(2, "0")}
            </span>
            {/* Mini progress bar */}
            <div style={{
              width: "80px",
              height: "2px",
              background: f.ink(0.06),
              borderRadius: "1px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${scrollProgress * 100}%`,
                height: "100%",
                background: f.ink(0.35),
                borderRadius: "1px",
                transition: "width 0.15s ease-out",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Issue bar ── */}
      {hasPhases && (
        <div className="px-8 md:px-14 pb-6 flex-shrink-0">
          <p style={{
            fontFamily: f.sans,
            fontSize: "clamp(13px, 1.3vw, 16px)",
            color: f.ink(0.35),
            lineHeight: 1.6,
            maxWidth: "600px",
          }}>
            {study.issue}
          </p>
        </div>
      )}

      {/* ── Timeline content ── */}
      {hasPhases ? (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Fade edges */}
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            background: `linear-gradient(to right, hsl(var(--background)) 0%, transparent 6%, transparent 94%, hsl(var(--background)) 100%)`,
          }} />

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`[data-tl-scroll]::-webkit-scrollbar { display: none; }`}</style>
            <div
              data-tl-scroll
              className="flex h-full"
              style={{
                minWidth: "max-content",
                paddingLeft: "clamp(40px, 6vw, 120px)",
                paddingRight: "clamp(120px, 15vw, 300px)",
              }}
            >
              {study.phases!.map((phase, i) => {
                const isVisible = visiblePhases.has(i);
                const isLast = i === totalPhases - 1;
                const isFirst = i === 0;
                const hasStats = phase.stats && phase.stats.length > 0;

                return (
                  <div
                    key={i}
                    className="flex flex-col relative h-full"
                    style={{
                      width: "clamp(340px, 28vw, 480px)",
                      flexShrink: 0,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(24px)",
                      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                    }}
                  >
                    {/* Phase content — vertically centered */}
                    <div className="flex-1 flex flex-col justify-center" style={{
                      paddingRight: "clamp(32px, 3vw, 60px)",
                    }}>
                      {/* Phase number + date */}
                      <div className="flex items-baseline gap-3 mb-4">
                        <span style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(48px, 5vw, 72px)",
                          fontWeight: 200,
                          color: f.ink(0.06),
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {phase.date && (
                          <span style={{
                            fontFamily: f.sans,
                            fontSize: "11px",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            color: f.ink(0.25),
                          }}>
                            {phase.date}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(20px, 2.2vw, 28px)",
                        fontWeight: 700,
                        color: f.ink(0.85),
                        lineHeight: 1.2,
                        letterSpacing: "-0.02em",
                        marginBottom: "12px",
                      }}>
                        {phase.title}
                      </h3>

                      {/* Accent line */}
                      <div style={{
                        width: "32px",
                        height: "2px",
                        background: f.ink(isLast ? 0.35 : 0.1),
                        borderRadius: "1px",
                        marginBottom: "16px",
                        transition: "background 0.6s ease",
                      }} />

                      {/* Description */}
                      <p style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(13px, 1.3vw, 15px)",
                        color: f.ink(0.45),
                        lineHeight: 1.85,
                        maxWidth: "380px",
                      }}>
                        {phase.description}
                      </p>

                      {/* Stats — final phase results */}
                      {hasStats && (
                        <div className="flex flex-wrap gap-3 mt-6">
                          {phase.stats!.map((stat, si) => (
                            <div
                              key={si}
                              className="flex flex-col"
                              style={{
                                padding: "16px 20px",
                                borderRadius: "12px",
                                background: f.ink(0.03),
                                border: `1px solid ${f.ink(0.05)}`,
                              }}
                            >
                              <span style={{
                                fontFamily: f.sans,
                                fontSize: "clamp(20px, 2.2vw, 28px)",
                                fontWeight: 700,
                                color: f.ink(0.8),
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                              }}>
                                {stat.value}
                              </span>
                              <span style={{
                                fontFamily: f.sans,
                                fontSize: "10px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                fontWeight: 500,
                                marginTop: "6px",
                                color: f.ink(0.3),
                              }}>
                                {stat.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Bottom timeline track ── */}
                    <div className="flex-shrink-0 flex items-center" style={{ height: "60px", paddingRight: "clamp(32px, 3vw, 60px)" }}>
                      {/* Node */}
                      <div className="relative flex-shrink-0" style={{
                        width: isLast ? "12px" : isFirst ? "10px" : "6px",
                        height: isLast ? "12px" : isFirst ? "10px" : "6px",
                        borderRadius: "50%",
                        background: isVisible
                          ? isLast ? f.ink(0.6) : isFirst ? f.ink(0.4) : f.ink(0.2)
                          : f.ink(0.06),
                        transition: "all 0.8s ease",
                        boxShadow: isLast && isVisible ? `0 0 24px ${f.ink(0.15)}` : "none",
                      }}>
                        {isLast && isVisible && (
                          <div className="absolute rounded-full" style={{
                            inset: "-4px",
                            border: `1px solid ${f.ink(0.1)}`,
                            borderRadius: "50%",
                          }} />
                        )}
                      </div>
                      {/* Connecting line */}
                      {!isLast && (
                        <div className="flex-1" style={{
                          height: "1px",
                          background: `linear-gradient(to right, ${f.ink(isVisible ? 0.12 : 0.04)}, ${f.ink(visiblePhases.has(i + 1) ? 0.12 : 0.03)})`,
                          transition: "background 1s ease",
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll hint — bottom right */}
          <div className="absolute bottom-6 right-8 md:right-14 flex items-center gap-2" style={{
            opacity: scrollProgress < 0.1 ? 0.6 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}>
            <p style={{
              fontFamily: f.sans,
              fontSize: "11px",
              color: f.ink(0.25),
              letterSpacing: "0.04em",
            }}>
              Scroll to explore
            </p>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" style={{ color: f.ink(0.2) }}>
              <path d="M1 6h16M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : (
        /* Coming soon state */
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
          <div className="text-center max-w-lg">
            <p style={{
              fontFamily: f.sans,
              fontSize: "clamp(15px, 1.6vw, 20px)",
              color: f.ink(0.4),
              lineHeight: 1.7,
              marginBottom: "24px",
            }}>
              {study.issue}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full" style={{
              background: f.ink(0.03),
              border: `1px solid ${f.ink(0.06)}`,
            }}>
              <div style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: f.ink(0.2),
              }} />
              <p style={{
                fontFamily: f.sans,
                fontSize: "12px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: f.ink(0.3),
              }}>
                {study.outcome}
              </p>
            </div>
            <p style={{
              fontFamily: f.sans,
              fontSize: "13px",
              color: f.ink(0.2),
              marginTop: "40px",
              letterSpacing: "0.02em",
            }}>
              Full timeline coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseTimelineOverlay;
