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
        <label
          className="text-[10px] tracking-[0.15em] uppercase flex-shrink-0"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.2)" }}
        >
          Stat Chips
        </label>
        <div className="flex-1 h-px" style={{ background: "hsl(0 0% 100% / 0.05)" }} />
      </div>

      <div className="flex flex-wrap gap-3">
        {stats.map((stat, i) => {
          const hidden = stat.visible === false;
          return (
            <div
              key={i}
              className="group relative flex flex-col px-4 py-3 min-w-[140px] max-w-[220px] transition-opacity"
              style={{
                background: "hsl(0 0% 4%)",
                border: "1px solid hsl(0 0% 100% / 0.06)",
                borderLeft: "2px solid hsl(0 80% 48% / 0.6)",
                opacity: hidden ? 0.4 : 1,
              }}
            >
              {/* Actions — top-right, visible on hover */}
              <div
                className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  onClick={() => update(i, { visible: !hidden })}
                  className="p-1 rounded transition-colors"
                  style={{ color: "hsl(0 0% 100% / 0.3)" }}
                >
                  {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onChange(stats.filter((_, j) => j !== i))}
                  className="p-1 rounded transition-colors hover:bg-[hsl(0_80%_48%_/_0.15)]"
                  style={{ color: "hsl(0 0% 100% / 0.3)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Label — large, red, mono */}
              <input
                ref={(el) => { labelRefs.current[i] = el; }}
                value={stat.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="$200M"
                className="bg-transparent outline-none border-none text-lg font-medium w-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: hidden ? "hsl(0 0% 100% / 0.25)" : "hsl(0 80% 48% / 0.9)",
                  textDecoration: hidden ? "line-through" : "none",
                }}
              />

              {/* Description — small, uppercase, tracking */}
              <input
                value={stat.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Description"
                className="bg-transparent outline-none border-none text-[9px] tracking-[0.15em] uppercase mt-1 w-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "hsl(0 0% 100% / 0.4)",
                }}
              />
            </div>
          );
        })}

        {/* Add card */}
        <button
          onClick={addStat}
          className="flex flex-col items-center justify-center min-w-[100px] min-h-[72px] px-4 py-3 transition-all hover:border-[hsl(0_80%_48%_/_0.3)]"
          style={{
            border: "1px dashed hsl(0 0% 100% / 0.1)",
            background: "transparent",
            color: "hsl(0 0% 100% / 0.15)",
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StatChipsEditor;
