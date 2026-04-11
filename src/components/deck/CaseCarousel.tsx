import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { CaseStudyData } from "./CaseTimelineOverlay";
import { caseStudyUi as ui } from "./caseStudyUi";

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
      <div ref={emblaRef} className="overflow-hidden" style={{ paddingLeft: "clamp(24px, 4vw, 80px)" }}>
        <div className="flex" style={{ gap: "clamp(16px, 1.5vw, 24px)", paddingTop: "12px", paddingBottom: "12px" }}>
          {studies.map((cs, i) => {
            const phaseCount = cs.phases?.length ?? 0;
            const hasPhases = phaseCount > 0;

            return (
              <button
                key={cs.id}
                onClick={() => onSelect(cs)}
                className="group flex-shrink-0 text-left"
                style={{
                  width: "clamp(320px, 26vw, 400px)",
                  minHeight: "clamp(220px, 22vh, 280px)",
                  borderRadius: ui.radius,
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  transition: "transform 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="flex h-full flex-col justify-between"
                  style={{
                    minHeight: "clamp(220px, 22vh, 280px)",
                    borderRadius: ui.radius,
                    padding: "28px 28px 24px",
                    background: ui.cardSurface,
                    border: ui.cardBorder,
                    transition: "background 0.25s ease, border-color 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = ui.cardSurfaceHover;
                    e.currentTarget.style.borderColor = ui.cardBorderStrong.replace("1px solid ", "");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ui.cardSurface;
                    e.currentTarget.style.borderColor = ui.cardBorder.replace("1px solid ", "");
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <span style={ui.meta}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={ui.meta}>
                        {hasPhases ? `${phaseCount} ${phaseCount === 1 ? "phase" : "phases"}` : "No timeline yet"}
                      </span>
                    </div>

                    <h3 style={ui.title}>{cs.name}</h3>

                    <p style={ui.body}>{cs.issue}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-6">
                    <span style={ui.smallMeta}>{hasPhases ? "Open timeline" : "Timeline coming soon"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "currentColor", opacity: 0.5 }} />
                  </div>
                </div>
              </button>
            );
          })}

          <div className="flex-shrink-0" style={{ width: "clamp(24px, 4vw, 80px)" }} />
        </div>
      </div>

      <div
        className="mt-8 flex items-center justify-between"
        style={{ paddingLeft: "clamp(24px, 4vw, 80px)", paddingRight: "clamp(24px, 4vw, 80px)" }}
      >
        <div className="flex items-center gap-2">
          {studies.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? "24px" : "6px",
                height: "6px",
                background: activeIdx === i ? ui.railActive : ui.rail,
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: "prev", canMove: canPrev, onPress: () => emblaApi?.scrollPrev(), Icon: ChevronLeft },
            { key: "next", canMove: canNext, onPress: () => emblaApi?.scrollNext(), Icon: ChevronRight },
          ].map(({ key, canMove, onPress, Icon }) => (
            <button
              key={key}
              onClick={onPress}
              disabled={!canMove}
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: "40px",
                height: "40px",
                border: canMove ? ui.cardBorder : `1px solid ${ui.rail}`,
                color: canMove ? ui.nodeActive : ui.node,
                background: "transparent",
                cursor: canMove ? "pointer" : "default",
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseCarousel;
