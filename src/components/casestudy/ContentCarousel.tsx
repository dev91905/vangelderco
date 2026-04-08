import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "@/lib/theme";

interface Slide { src: string; alt?: string; caption?: string; }
interface ContentCarouselProps { slides: Slide[]; }

const ContentCarousel = ({ slides }: ContentCarouselProps) => {
  const [current, setCurrent] = useState(0);
  if (!slides.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-video flex items-center justify-center overflow-hidden rounded-xl" style={{ background: t.white, border: t.border(0.06) }}>
        {slides[current].src ? (
          <img src={slides[current].src} alt={slides[current].alt || ""} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>{slides[current].alt || `Slide ${current + 1}`}</span>
        )}
        {slides.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1" style={{ color: t.ink(0.4) }}><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: t.ink(0.4) }}><ChevronRight size={20} /></button>
          </>
        )}
      </div>
      {slides[current].caption && <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{slides[current].caption}</span>}
      {slides.length > 1 && (
        <div className="flex gap-1.5 justify-center">
          {slides.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 rounded-full transition-colors" style={{ background: i === current ? t.ink(0.6) : t.ink(0.12) }} />)}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
