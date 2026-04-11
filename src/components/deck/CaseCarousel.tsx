import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { t } from "@/lib/theme";
import type { CaseStudyData } from "./CaseTimelineOverlay";

const f = { sans: t.sans, ink: t.ink };

/* ── Shared design tokens for card ↔ timeline cohesion ── */
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
  },
  cardBorder: f.ink(0.06),
  cardBorderHover: f.ink(0.12),
};

interface Props {
  studies: CaseStudyData[];
  isActive: boolean;
  onSelect: (study: CaseStudyData) => void;
}

const CaseCarousel: React.FC<Props> = ({ studies, isActive, onSelect }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setActiveIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onEmblaSelect);
    emblaApi.on("reInit", onEmblaSelect);
    onEmblaSelect();
    return () => {
      emblaApi.off("select", onEmblaSelect);
      emblaApi.off("reInit", onEmblaSelect);
    };
  }, [emblaApi, onEmblaSelect]);

  return (
    <div
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
      }}
    >
      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden" style={{ paddingLeft: "clamp(24px, 4vw, 80px)" }}>
        <div className="flex" style={{ gap: "clamp(16px, 1.5vw, 24px)", paddingTop: "12px", paddingBottom: "12px" }}>
          {studies.map((cs, i) => {
            const hasPhases = cs.phases && (cs.phases as unknown[]).length > 0;

            return (
              <button
                key={cs.id}
                onClick={() => onSelect(cs)}
                className="flex-shrink-0 text-left group relative"
                style={{
                  width: "clamp(320px, 26vw, 420px)",
                  minHeight: "clamp(240px, 22vh, 320px)",
                  borderRadius: TOKEN.radius,
                  padding: "0",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                }}
              >
                {/* Card body */}
                <div
                  className="flex flex-col justify-between h-full relative"
                  style={{
                    padding: "clamp(28px, 3vw, 40px) clamp(24px, 2.5vw, 36px)",
                    borderRadius: TOKEN.radius,
                    minHeight: "clamp(240px, 22vh, 320px)",
                    background: f.ink(0.02),
                    border: `1px solid ${TOKEN.cardBorder}`,
                    transition: "border-color 0.4s ease, background 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = TOKEN.cardBorderHover;
                    e.currentTarget.style.background = f.ink(0.04);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = TOKEN.cardBorder;
                    e.currentTarget.style.background = f.ink(0.02);
                  }}
                >
                  {/* Top section */}
                  <div className="flex flex-col gap-3">
                    {/* Phase count tag — matches timeline tag style */}
                    <div
                      className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        background: TOKEN.tagBg,
                        border: TOKEN.tagBorder,
                      }}
                    >
                      {hasPhases && (
                        <div style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: f.ink(0.25),
                        }} />
                      )}
                      <span style={TOKEN.tagFont}>
                        {hasPhases
                          ? `${(cs.phases as unknown[]).length} Phases`
                          : "Coming Soon"}
                      </span>
                    </div>

                    {/* Name */}
                    <h3
                      style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(18px, 2vw, 24px)",
                        fontWeight: 700,
                        color: f.ink(0.85),
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                        marginTop: "4px",
                      }}
                    >
                      {cs.name}
                    </h3>

                    {/* Accent line — same as timeline */}
                    <div style={{
                      width: "24px",
                      height: "2px",
                      background: f.ink(0.1),
                      borderRadius: "1px",
                    }} />

                    {/* Issue description */}
                    <p
                      style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(13px, 1.2vw, 15px)",
                        color: f.ink(0.4),
                        lineHeight: 1.7,
                      }}
                    >
                      {cs.issue}
                    </p>
                  </div>

                  {/* Bottom section — outcome + arrow */}
                  <div className="flex items-end justify-between mt-6 gap-4">
                    <p
                      style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(11px, 1vw, 13px)",
                        color: f.ink(0.25),
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      {cs.outcome}
                    </p>
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{
                        width: "36px",
                        height: "36px",
                        border: `1px solid ${f.ink(0.08)}`,
                        color: f.ink(0.2),
                        transition: "all 0.4s ease",
                      }}
                    >
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ color: "inherit" }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Spacer for right padding */}
          <div className="flex-shrink-0" style={{ width: "clamp(24px, 4vw, 80px)" }} />
        </div>
      </div>

      {/* Navigation controls */}
      <div
        className="flex items-center justify-between mt-8"
        style={{ paddingLeft: "clamp(24px, 4vw, 80px)", paddingRight: "clamp(24px, 4vw, 80px)" }}
      >
        {/* Dots */}
        <div className="flex items-center gap-2">
          {studies.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? "24px" : "6px",
                height: "6px",
                background: f.ink(activeIdx === i ? 0.4 : 0.1),
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          {[
            { dir: "prev", can: canPrev, action: () => emblaApi?.scrollPrev(), Icon: ChevronLeft },
            { dir: "next", can: canNext, action: () => emblaApi?.scrollNext(), Icon: ChevronRight },
          ].map(({ dir, can, action, Icon }) => (
            <button
              key={dir}
              onClick={action}
              disabled={!can}
              className="flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: "40px",
                height: "40px",
                border: `1px solid ${f.ink(can ? 0.08 : 0.04)}`,
                color: f.ink(can ? 0.4 : 0.1),
                background: "transparent",
                cursor: can ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (can) {
                  e.currentTarget.style.background = f.ink(0.04);
                  e.currentTarget.style.borderColor = f.ink(0.15);
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = f.ink(can ? 0.08 : 0.04);
              }}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseCarousel;
