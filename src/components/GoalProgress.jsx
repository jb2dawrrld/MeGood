import { Card } from "./ui/Card";
import { Target, TrendingUp } from "lucide-react";

export default function GoalProgress({ 
  steps = 0, caloriesBurned = 0, caloriesConsumed = 0 }) {
  // Define goals
  const goals = {
    steps: 10000,
    caloriesBurned: 500,
  };

  // Calculate percentages
  const stepsProgress = Math.min((steps / goals.steps) * 100, 100);
  const caloriesBurnedProgress = Math.min((caloriesBurned / goals.caloriesBurned) * 100, 100);
  
  // Calculate net calories (consumed - burned)
  const netCalories = caloriesConsumed - caloriesBurned;
  const calorieBalance = netCalories > 0 ? "surplus" : "deficit";

  const progressBars = [
    {
      label: "Daily Steps",
      current: steps,
      goal: goals.steps,
      progress: stepsProgress,
      unit: "steps",
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
    },
    {
      label: "Calories Burned",
      current: caloriesBurned,
      goal: goals.caloriesBurned,
      progress: caloriesBurnedProgress,
      unit: "kcal",
      color: "bg-orange-500",
      lightColor: "bg-orange-100",
    }
  ];

  return (
    <Card className="p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-gray-900 flex items-center gap-2">

          Goal Progress
        </h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-6">
        {progressBars.map((bar, index) => (
          <div key={index} className="space-y-2">
            {/* Label and Stats */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{bar.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {bar.current.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">/ {bar.goal.toLocaleString()} {bar.unit}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
              <div
                className={`h-full ${bar.color} transition-all duration-1000 ease-out rounded-full relative overflow-hidden`}
                style={{ width: `${bar.progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 w-full h-full">
                  <div 
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Percentage */}
            <div className="flex justify-end">
              <span className="text-xs font-medium text-gray-600">
                {bar.progress.toFixed(0)}% complete
              </span>
            </div>
          </div>
        ))}

        {/* Calorie Balance Section */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Calorie Balance</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold ${netCalories > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netCalories > 0 ? '+' : ''}{netCalories.toLocaleString()} kcal
              </div>
              <div className="text-xs text-gray-500 capitalize">{calorieBalance}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </Card>
  );
}