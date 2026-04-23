export default function MetricsCard({
  icon,
  label,
  value,
  unit,
  color,
  isFirst,
  isLast,
  progress = 0,
  deltaLabel,
  ringColor = "#94a3b8",
}) {
  const IconComponent = icon;
  const ringProgress = Math.max(0, Math.min(progress, 100));
  const isPositive = deltaLabel?.startsWith("+");
  const radius = 26;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const dash = (ringProgress / 100) * circumference;

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-2 py-2 ${!isFirst && !isLast ? "lg:border-l lg:border-r lg:px-8" : ""}`}
      style={{ borderColor: "var(--border-soft)" }}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <div className="relative flex h-18 w-18 items-center justify-center">
        <svg className="-rotate-90" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div
          className="absolute grid place-items-center rounded-full border p-2"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: "var(--surface-card)",
          }}
        >
          <IconComponent className={`w-5 h-5 ${color} ${label === "Heart Rate" ? "animate-pulse" : ""}`} />
        </div>
      </div>
      <div className="text-5xl font-light leading-none" style={{ color: "var(--text-primary)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>{unit}</div>
      {deltaLabel && (
        <div
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: isPositive ? "var(--chip-positive-bg)" : "var(--chip-negative-bg)",
            color: isPositive ? "var(--chip-positive-text)" : "var(--chip-negative-text)",
          }}
        >
          {deltaLabel}
        </div>
      )}
    </div>
  );
}
