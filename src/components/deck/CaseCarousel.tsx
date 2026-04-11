import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CaseStudyData } from "./CaseTimelineOverlay";
import { caseStudyUi as ui } from "./caseStudyUi";

interface Props {
  studies: CaseStudyData[];
  isActive: boolean;
  onSelect: (study: CaseStudyData) => void;
}

const sidePadding = "clamp(24px, 4vw, 80px)";

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
      <div
        className="mb-5 flex items-center justify-between"
        style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
        <span style={ui.smallMeta}>
          {String(activeIdx + 1).padStart(2, "0")} / {String(studies.length).padStart(2, "0")}
        </span>

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

      <div
        ref={emblaRef}
        className="overflow-hidden"
        style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
        <div className="flex" style={{ gap: "clamp(16px, 1.5vw, 24px)", paddingTop: "8px", paddingBottom: "8px" }}>
          {studies.map((cs, index) => {
            const phaseCount = cs.phases?.length ?? 0;
            const hasPhases = phaseCount > 0;

            return (
              <button
                key={cs.id}
                onClick={() => onSelect(cs)}
                className="flex-shrink-0 text-left"
                style={{
                  width: "clamp(320px, 28vw, 420px)",
                  minHeight: "clamp(210px, 20vh, 250px)",
                  borderRadius: ui.radius,
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="h-full"
                  style={{
                    minHeight: "clamp(210px, 20vh, 250px)",
                    borderRadius: ui.radius,
                    padding: "24px 24px 22px",
                    background: ui.cardSurface,
                    border: ui.cardBorder,
                    transition: "background 0.2s ease, border-color 0.2s ease",
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
                  <div className="flex items-center justify-between gap-4">
                    <span style={ui.meta}>{String(index + 1).padStart(2, "0")}</span>
                    <span style={ui.meta}>
                      {hasPhases ? `${phaseCount} ${phaseCount === 1 ? "phase" : "phases"}` : "No timeline"}
                    </span>
                  </div>

                  <h3 style={{ ...ui.title, marginTop: "18px" }}>{cs.name}</h3>

                  <p
                    style={{
                      ...ui.body,
                      marginTop: "12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cs.issue}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CaseCarousel;
