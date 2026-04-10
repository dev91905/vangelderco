import { t } from "@/lib/theme";

interface Stat { label: string; description: string; visible?: boolean; }
interface StatChipsProps { stats: Stat[]; visible: boolean; }

const StatChips = ({ stats, visible }: StatChipsProps) => {
  if (!visible || !stats.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col px-4 py-3 rounded-xl backdrop-blur-sm" style={{
          background: t.accent(0.10),
          border: `1px solid ${t.accent(0.22)}`,
          animation: `fade-up 0.4s ease-out ${i * 0.1}s both`,
        }}>
          <span className="text-[18px] md:text-[22px] font-bold" style={{ fontFamily: t.sans, color: t.accent(0.9) }}>{stat.label}</span>
          <span className="text-[10px] tracking-[0.08em] uppercase mt-1" style={{ fontFamily: t.sans, color: t.accent(0.5) }}>{stat.description}</span>
        </div>
      ))}
    </div>
  );
};

export default StatChips;
