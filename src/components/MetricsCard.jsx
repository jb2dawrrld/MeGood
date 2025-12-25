export default function MetricsCard({ icon: Icon, label, value, unit, color, isFirst, isLast }) {
  return (
    <div 
      className={`flex flex-col items-center gap-3 ${!isFirst && !isLast ? 'border-l border-r border-gray-200 px-8' : ''}`}
    >
      {/* Icon and Label */}
      <div className="flex items-center gap-2">
        <Icon className={`w-6 h-6 ${color} ${label === 'Heart Rate' ? 'animate-pulse' : ''}`} />
        <span className="font-light text-gray-600 text-sm uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="text-5xl font-light text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Unit */}
      <div className="text-sm text-gray-600">{unit}</div>
    </div>
  );
}