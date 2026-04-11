import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { t } from "@/lib/theme";

const f = { sans: t.sans, ink: t.ink, cream: t.cream };

/* ── Shared design tokens (mirroring CaseCarousel) ── */
const TOKEN = {
  radius: "16px",
  tagBg: f.ink(0.04),
  tagBorder: `1px solid ${f.ink(0.06)}`,
  tagFont: {
    fontFamily: f.sans,
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    color: f.ink(0.3),
  } as React.CSSProperties,
};

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
        <div className="flex items-center gap-5">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: "40px",
              height: "40px",
              border: `1px solid ${f.ink(0.08)}`,
              color: f.ink(0.3),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = f.ink(0.04);
              e.currentTarget.style.borderColor = f.ink(0.15);
              e.currentTarget.style.color = f.ink(0.6);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = f.ink(0.08);
              e.currentTarget.style.color = f.ink(0.3);
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            {/* Tag — same pill as carousel cards */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: TOKEN.tagBg, border: TOKEN.tagBorder }}
            >
              <div style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: f.ink(0.25),
              }} />
              <span style={TOKEN.tagFont}>Case Study</span>
            </div>
            <h2 style={{
              fontFamily: f.sans,
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 700,
              color: f.ink(0.85),
              letterSpacing: "-0.02em",
            }}>
              {study.name}
            </h2>
          </div>
        </div>

        {/* Phase counter + progress — mirrors carousel dots rhythm */}
        {hasPhases && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {study.phases!.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activePhase === i ? "24px" : "6px",
                    height: "6px",
                    background: f.ink(activePhase === i ? 0.4 : 0.1),
                  }}
                />
              ))}
            </div>
            <span style={{
              fontFamily: f.sans,
              fontSize: "11px",
              color: f.ink(0.2),
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}>
              {String(activePhase + 1).padStart(2, "0")} / {String(totalPhases).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* ── Issue bar ── */}
      {hasPhases && (
        <div className="px-8 md:px-14 pb-5 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div style={{
              width: "24px",
              height: "2px",
              background: f.ink(0.1),
              borderRadius: "1px",
              marginTop: "10px",
              flexShrink: 0,
            }} />
            <p style={{
              fontFamily: f.sans,
              fontSize: "clamp(13px, 1.3vw, 15px)",
              color: f.ink(0.35),
              lineHeight: 1.7,
              maxWidth: "600px",
            }}>
              {study.issue}
            </p>
          </div>
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
                      {/* Phase number + date — same tag pill style */}
                      <div className="flex items-center gap-3 mb-4">
                        <span style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(36px, 4vw, 56px)",
                          fontWeight: 700,
                          color: f.ink(0.06),
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {phase.date && (
                          <div
                            className="inline-flex items-center px-3 py-1 rounded-full"
                            style={{ background: TOKEN.tagBg, border: TOKEN.tagBorder }}
                          >
                            <span style={TOKEN.tagFont}>{phase.date}</span>
                          </div>
                        )}
                      </div>

                      {/* Title — same size/weight as card titles */}
                      <h3 style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(18px, 2vw, 24px)",
                        fontWeight: 700,
                        color: f.ink(0.85),
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                        marginBottom: "12px",
                      }}>
                        {phase.title}
                      </h3>

                      {/* Accent line — same as card */}
                      <div style={{
                        width: "24px",
                        height: "2px",
                        background: f.ink(isLast ? 0.3 : 0.1),
                        borderRadius: "1px",
                        marginBottom: "14px",
                        transition: "background 0.6s ease",
                      }} />

                      {/* Description — same body style as card issue text */}
                      <p style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(13px, 1.2vw, 15px)",
                        color: f.ink(0.4),
                        lineHeight: 1.7,
                        maxWidth: "380px",
                      }}>
                        {phase.description}
                      </p>

                      {/* Stats — using same card-like containers */}
                      {hasStats && (
                        <div className="flex flex-wrap gap-3 mt-6">
                          {phase.stats!.map((stat, si) => (
                            <div
                              key={si}
                              className="flex flex-col"
                              style={{
                                padding: "14px 18px",
                                borderRadius: TOKEN.radius,
                                background: f.ink(0.02),
                                border: `1px solid ${f.ink(0.06)}`,
                              }}
                            >
                              <span style={{
                                fontFamily: f.sans,
                                fontSize: "clamp(18px, 2vw, 24px)",
                                fontWeight: 700,
                                color: f.ink(0.85),
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                              }}>
                                {stat.value}
                              </span>
                              <span style={{
                                ...TOKEN.tagFont,
                                marginTop: "6px",
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
                      <div className="relative flex-shrink-0" style={{
                        width: isLast ? "12px" : isFirst ? "10px" : "6px",
                        height: isLast ? "12px" : isFirst ? "10px" : "6px",
                        borderRadius: "50%",
                        background: isVisible
                          ? isLast ? f.ink(0.5) : isFirst ? f.ink(0.35) : f.ink(0.15)
                          : f.ink(0.06),
                        transition: "all 0.8s ease",
                        boxShadow: isLast && isVisible ? `0 0 20px ${f.ink(0.12)}` : "none",
                      }}>
                        {isLast && isVisible && (
                          <div className="absolute rounded-full" style={{
                            inset: "-4px",
                            border: `1px solid ${f.ink(0.08)}`,
                            borderRadius: "50%",
                          }} />
                        )}
                      </div>
                      {!isLast && (
                        <div className="flex-1" style={{
                          height: "1px",
                          background: `linear-gradient(to right, ${f.ink(isVisible ? 0.1 : 0.04)}, ${f.ink(visiblePhases.has(i + 1) ? 0.1 : 0.03)})`,
                          transition: "background 1s ease",
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 right-8 md:right-14 flex items-center gap-2" style={{
            opacity: scrollProgress < 0.1 ? 0.5 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}>
            <p style={{
              fontFamily: f.sans,
              fontSize: "11px",
              color: f.ink(0.2),
              letterSpacing: "0.06em",
            }}>
              Scroll to explore
            </p>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" style={{ color: f.ink(0.15) }}>
              <path d="M1 6h16M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
          <div className="text-center max-w-lg">
            <p style={{
              fontFamily: f.sans,
              fontSize: "clamp(15px, 1.6vw, 18px)",
              color: f.ink(0.4),
              lineHeight: 1.7,
              marginBottom: "24px",
            }}>
              {study.issue}
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full"
              style={{ background: TOKEN.tagBg, border: TOKEN.tagBorder }}
            >
              <div style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: f.ink(0.25),
              }} />
              <span style={TOKEN.tagFont}>{study.outcome}</span>
            </div>
            <p style={{
              fontFamily: f.sans,
              fontSize: "13px",
              color: f.ink(0.18),
              marginTop: "40px",
              letterSpacing: "0.04em",
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
