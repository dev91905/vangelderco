import { t } from "@/lib/theme";

interface Stat { label: string; description: string; visible?: boolean; }
interface StatChipsProps { stats: Stat[]; visible: boolean; }

const StatChips = ({ stats, visible }: StatChipsProps) => {
  if (!visible || !stats.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col px-4 py-3 rounded-xl" style={{
          background: t.white, border: t.border(0.06), borderLeft: `2px solid ${t.ink(0.2)}`,
          animation: `fade-up 0.4s ease-out ${i * 0.1}s both`,
        }}>
          <span className="text-[18px] md:text-[22px] font-medium" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>{stat.label}</span>
          <span className="text-[10px] tracking-[0.08em] uppercase mt-1" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{stat.description}</span>
        </div>
      ))}
    </div>
  );
};

export default StatChips;
