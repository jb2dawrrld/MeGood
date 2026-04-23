import { Card } from "./ui/Card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatDelta = (value) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
};

const heatClassForValue = (value, maxValue) => {
  if (maxValue === 0) return "bg-slate-100 text-slate-400";

  const ratio = value / maxValue;
  if (ratio > 0.8) return "bg-blue-600 text-white";
  if (ratio > 0.55) return "bg-blue-500 text-white";
  if (ratio > 0.3) return "bg-blue-300 text-blue-900";
  return "bg-blue-100 text-blue-700";
};

const chartTooltip = {
  contentStyle: {
    borderRadius: "12px",
    borderColor: "#cbd5e1",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
  },
};

export default function ModernMetricsSection({
  weeklyStepSeries,
  weeklySteps,
  monthlyCalories,
  heartRateHistory,
  insights,
  isDarkMode = false,
}) {
  const bestRatioDay = monthlyCalories.reduce(
    (best, day) => (day.ratio > best.ratio ? day : best),
    { ratio: 0, dateLabel: "-", caloriesBurned: 0, caloriesConsumed: 0 },
  );

  const monthlyRatios = monthlyCalories
    .map((day) => day.ratio)
    .filter((ratio) => ratio > 0);
  const percentile = monthlyRatios.length
    ? Math.round(
        (monthlyRatios.filter((ratio) => ratio <= bestRatioDay.ratio).length /
          monthlyRatios.length) *
          100,
      )
    : 0;

  const maxWeekly = Math.max(...weeklySteps.map((day) => day.steps), 0);
  const heartRateAverage = heartRateHistory.length
    ? Math.round(
        heartRateHistory.reduce((sum, point) => sum + point.heartRate, 0) /
          heartRateHistory.length,
      )
    : 0;
  const heartRateMax = heartRateHistory.length
    ? Math.max(...heartRateHistory.map((point) => point.heartRate))
    : 0;
  const cardioMinutes = heartRateHistory.filter((point) => point.heartRate >= 120)
    .length;
  const chartAxisColor = isDarkMode ? "#94a3b8" : "#64748b";
  const chartGridColor = isDarkMode ? "#334155" : "#e2e8f0";
  const chartHeroGrid = isDarkMode ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.25)";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Step Journey</p>
              <h3 className="text-2xl font-semibold">Weekly Steps Chart</h3>
              <p className="text-sm text-blue-100 mt-1">{insights.stepPace}</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm">{insights.stepGoalStatus}</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStepSeries}>
                <defs>
                  <linearGradient id="stepFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartHeroGrid} />
                <XAxis dataKey="dayLabel" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip {...chartTooltip} />
                <ReferenceLine y={10000} stroke="#fbbf24" strokeDasharray="5 5" />
                <Area
                  type="monotone"
                  dataKey="steps"
                  stroke="#bfdbfe"
                  strokeWidth={3}
                  fill="url(#stepFill)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-b from-amber-50 via-white to-orange-50 border border-amber-100">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Spotlight</p>
          <h3 className="text-xl font-semibold text-slate-900 mt-1">Best Burn/Consume Ratio</h3>
          <p className="text-sm text-slate-500 mt-1">Highest quality day this month</p>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-semibold text-amber-700">
              {bestRatioDay.ratio.toFixed(2)}
            </span>
            <span className="text-slate-500 mb-1">ratio</span>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            {bestRatioDay.dateLabel} - Top {Math.max(1, percentile)}%
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Burned</span>
                <span>{Math.round(bestRatioDay.caloriesBurned)} kcal</span>
              </div>
              <div className="h-2 rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${Math.min((bestRatioDay.caloriesBurned / 900) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Consumed</span>
                <span>{Math.round(bestRatioDay.caloriesConsumed)} kcal</span>
              </div>
              <div className="h-2 rounded-full bg-orange-100">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{ width: `${Math.min((bestRatioDay.caloriesConsumed / 2200) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2 surface-premium">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>30-Day Trend</p>
              <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Calories Balance Timeline</h3>
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>{insights.calorieTrend}</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="shortLabel" tick={{ fill: chartAxisColor, fontSize: 11 }} />
                <YAxis tick={{ fill: chartAxisColor, fontSize: 11 }} />
                <Tooltip {...chartTooltip} />
                <ReferenceLine y={0} stroke={chartAxisColor} />
                <Bar dataKey="balance" fill="#2563eb" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 surface-premium">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>This Week</p>
          <h3 className="text-xl font-semibold mt-1" style={{ color: "var(--text-primary)" }}>Steps Heatmap</h3>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{insights.weeklySteps}</p>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {weeklySteps.map((day) => (
              <div
                key={day.dayLabel}
                className={`h-14 rounded-lg flex flex-col items-center justify-center text-xs transition-transform duration-300 hover:-translate-y-0.5 ${heatClassForValue(
                  day.steps,
                  maxWeekly,
                )}`}
                title={`${day.dayLabel}: ${day.steps.toLocaleString()} steps`}
              >
                <span className="font-medium">{day.shortLabel}</span>
                <span>{Math.round(day.steps / 1000)}k</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-rose-50 via-white to-red-50 border border-rose-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-600">Live Session</p>
            <h3 className="text-xl font-semibold text-slate-900">Heart Rate Story</h3>
          </div>
          <div className="flex gap-5 text-sm">
            <div>
              <p className="text-slate-500">Avg</p>
              <p className="font-semibold text-slate-800">{heartRateAverage} bpm</p>
            </div>
            <div>
              <p className="text-slate-500">Max</p>
              <p className="font-semibold text-slate-800">{heartRateMax} bpm</p>
            </div>
            <div>
              <p className="text-slate-500">Cardio Time</p>
              <p className="font-semibold text-slate-800">{cardioMinutes} min</p>
            </div>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heartRateHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#3f3f46" : "#fecdd3"} />
              <XAxis dataKey="minuteLabel" tick={{ fill: isDarkMode ? "#fda4af" : "#9f1239", fontSize: 11 }} />
              <YAxis tick={{ fill: isDarkMode ? "#fda4af" : "#9f1239", fontSize: 11 }} />
              <Tooltip {...chartTooltip} />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#e11d48"
                strokeWidth={3}
                dot={false}
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Warmup &lt; 110</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Fat burn 110-129</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Cardio 130+</span>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 border border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Steps vs Yesterday</p>
            <p className="text-lg font-semibold">{formatDelta(insights.stepsDeltaDay)}</p>
          </div>
          <div>
            <p className="text-slate-400">Burned vs Weekly Avg</p>
            <p className="text-lg font-semibold">{formatDelta(insights.burnDeltaWeek)}</p>
          </div>
          <div>
            <p className="text-slate-400">Calories Balance Direction</p>
            <p className="text-lg font-semibold">{insights.balanceDirection}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
