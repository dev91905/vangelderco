import { Plus, X, Eye, EyeOff, GripVertical } from "lucide-react";

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
  const update = (i: number, partial: Partial<Stat>) => {
    const ns = [...stats];
    ns[i] = { ...ns[i], ...partial };
    onChange(ns);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.4)" }}>
          Stat Chips
        </label>
        <button
          onClick={() => onChange([...stats, { label: "", description: "", visible: true }])}
          className="text-[10px] flex items-center gap-1 px-2 py-1 transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.6)", border: "1px solid hsl(0 80% 48% / 0.2)" }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2 p-2" style={{ background: "hsl(0 0% 4%)", border: "1px solid hsl(0 0% 12%)" }}>
          <GripVertical className="w-3 h-3 cursor-grab" style={{ color: "hsl(0 0% 100% / 0.2)" }} />
          <input
            value={stat.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="$200M"
            className="w-24 bg-transparent outline-none text-sm font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48%)" }}
          />
          <input
            value={stat.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Description..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.6)" }}
          />
          <button onClick={() => update(i, { visible: !(stat.visible !== false) })} className="p-1 hover:bg-[hsl(0_0%_10%)] rounded transition-colors">
            {stat.visible !== false ? <Eye className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.4)" }} /> : <EyeOff className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.2)" }} />}
          </button>
          <button onClick={() => onChange(stats.filter((_, j) => j !== i))} className="p-1 hover:bg-[hsl(0_80%_48%_/_0.1)] rounded transition-colors">
            <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
          </button>
        </div>
      ))}

      {stats.length === 0 && (
        <p className="text-[10px] py-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.2)" }}>
          No stats — add metrics to display at the top of the case study
        </p>
      )}
    </div>
  );
};

export default StatChipsEditor;
