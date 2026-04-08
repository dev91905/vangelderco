import { useRef, useEffect, useState } from "react";
import { Plus, X, Eye, EyeOff } from "lucide-react";

interface Stat {
  label: string;
  description: string;
  visible?: boolean;
}

interface StatChipsEditorProps {
  stats: Stat[];
  onChange: (stats: Stat[]) => void;
}

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const StatChipsEditor = ({ stats, onChange }: StatChipsEditorProps) => {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const labelRefs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (i: number, partial: Partial<Stat>) => {
    const ns = [...stats];
    ns[i] = { ...ns[i], ...partial };
    onChange(ns);
  };

  const addStat = () => {
    onChange([...stats, { label: "", description: "", visible: true }]);
    setFocusIndex(stats.length);
  };

  useEffect(() => {
    if (focusIndex !== null && labelRefs.current[focusIndex]) {
      labelRefs.current[focusIndex]?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, stats.length]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] tracking-[0.06em] uppercase flex-shrink-0"
          style={{ ...label, color: "hsl(30 10% 12% / 0.3)" }}
        >
          Stat Chips
        </span>
        <div className="flex-1 h-px" style={{ background: "hsl(30 10% 12% / 0.06)" }} />
      </div>

      <div className="flex flex-wrap gap-3">
        {stats.map((stat, i) => {
          const hidden = stat.visible === false;
          return (
            <div
              key={i}
              className="group relative flex flex-col px-4 py-3 min-w-[140px] max-w-[220px] transition-opacity rounded-xl"
              style={{
                background: "hsl(0 0% 100%)",
                border: "1px solid hsl(30 10% 12% / 0.06)",
                borderLeft: "2px solid hsl(30 10% 12% / 0.2)",
                opacity: hidden ? 0.4 : 1,
              }}
            >
              <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => update(i, { visible: !hidden })}
                  className="p-1 rounded transition-colors"
                  style={{ color: "hsl(30 10% 12% / 0.3)" }}
                >
                  {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onChange(stats.filter((_, j) => j !== i))}
                  className="p-1 rounded transition-colors hover:bg-[hsl(0_60%_50%_/_0.06)]"
                  style={{ color: "hsl(30 10% 12% / 0.3)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <input
                ref={(el) => { labelRefs.current[i] = el; }}
                value={stat.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="$200M"
                className="bg-transparent outline-none border-none text-lg font-medium w-full"
                style={{
                  ...label,
                  color: hidden ? "hsl(30 10% 12% / 0.25)" : "hsl(30 10% 12% / 0.8)",
                  textDecoration: hidden ? "line-through" : "none",
                }}
              />

              <input
                value={stat.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Description"
                className="bg-transparent outline-none border-none text-[11px] tracking-[0.05em] uppercase mt-1 w-full"
                style={{
                  ...label,
                  color: "hsl(30 10% 12% / 0.35)",
                }}
              />
            </div>
          );
        })}

        <button
          onClick={addStat}
          className="flex flex-col items-center justify-center min-w-[100px] min-h-[72px] px-4 py-3 transition-all rounded-xl hover:border-[hsl(30_10%_12%_/_0.15)]"
          style={{
            border: "1px dashed hsl(30 10% 12% / 0.1)",
            background: "transparent",
            color: "hsl(30 10% 12% / 0.2)",
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StatChipsEditor;
