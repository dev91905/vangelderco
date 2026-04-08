import { t } from "@/lib/theme";

interface Stat { label: string; description: string; visible?: boolean; }
interface StatChipsProps { stats: Stat[]; visible: boolean; }

const StatChips = ({ stats, visible }: StatChipsProps) => {
  if (!visible || !stats.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col px-4 py-3 rounded-xl" style={{
          background: t.ink(0.9), border: "none",
          animation: `fade-up 0.4s ease-out ${i * 0.1}s both`,
        }}>
          <span className="text-[18px] md:text-[22px] font-medium" style={{ fontFamily: t.sans, color: t.cream }}>{stat.label}</span>
          <span className="text-[10px] tracking-[0.08em] uppercase mt-1" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>{stat.description}</span>
        </div>
      ))}
    </div>
  );
};

export default StatChips;
