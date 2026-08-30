export default function StatTile({
  label,
  value,
  total,
  emoji
}: {
  label: string;
  value: number;
  total?: number;
  emoji: string;
}) {
  return (
    <div className="lab-card p-4">
      <div className="flex items-center gap-2 text-mist-400">
        <span className="text-lg">{emoji}</span>
        <span className="section-eyebrow">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-mist-100">
        {value}
        {total ? <span className="text-base font-normal text-mist-400"> / {total}</span> : null}
      </p>
      {total ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bio-dim to-bio"
            style={{ width: `${Math.min(100, (value / total) * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
