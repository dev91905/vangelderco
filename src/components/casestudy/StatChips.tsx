interface Stat {
  label: string;
  description: string;
  visible?: boolean;
}

interface StatChipsProps {
  stats: Stat[];
  visible: boolean;
}

const StatChips = ({ stats, visible }: StatChipsProps) => {
  if (!visible || !stats.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col px-4 py-3"
          style={{
            background: "hsl(0 0% 4%)",
            border: "1px solid hsl(0 0% 100% / 0.06)",
            borderLeft: "2px solid hsl(40 50% 57% / 0.6)",
            animation: `fade-up 0.4s ease-out ${i * 0.1}s both`,
          }}
        >
          <span
            className="text-[18px] md:text-[22px] font-medium"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(40 50% 57% / 0.9)",
            }}
          >
            {stat.label}
          </span>
          <span
            className="text-[9px] tracking-[0.15em] uppercase mt-1"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(0 0% 100% / 0.4)",
            }}
          >
            {stat.description}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatChips;
