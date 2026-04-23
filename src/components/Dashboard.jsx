import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getMetrics, getHeartRate, getMetricsRange, updateMetrics } from "../api/metrics";
import { Card } from "./ui/Card";
import { Flame, Heart, Footprints } from "lucide-react";
import Header from "./Header";
import MetricsCard from "./MetricsCard";
import CaloriesConsumedCard from "./CaloriesConsumedCard";
import GoalProgress from "./GoalProgress";
import ModernMetricsSection from "./ModernMetricsSection";

const toIsoDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toShortDay = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });

const toDayLabel = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

const toShortDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const buildFallbackRangeData = (todaySteps, todayBurned, todayConsumed) => {
  const today = new Date();
  const data = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - offset);
    const date = toIsoDate(dateObj);
    const burnNoise = 0.7 + Math.random() * 0.5;
    const consumeNoise = 0.8 + Math.random() * 0.4;
    const stepNoise = 0.65 + Math.random() * 0.7;

    data.push({
      date,
      steps: Math.max(800, Math.round(todaySteps * stepNoise)),
      caloriesBurned: Math.max(80, Math.round(todayBurned * burnNoise)),
      caloriesConsumed: Math.max(200, Math.round(todayConsumed * consumeNoise)),
    });
  }

  return data.map((item, index) => {
    if (index === data.length - 1) {
      return {
        ...item,
        steps: todaySteps,
        caloriesBurned: todayBurned,
        caloriesConsumed: todayConsumed,
      };
    }
    return item;
  });
};

export default function Dashboard({ userName, userFullName, userId, onSignOut }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [rangeMetrics, setRangeMetrics] = useState([]);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  
  // Use refs to track latest values for use in interval callback
  const stepsRef = useRef(0);
  const caloriesBurnedRef = useRef(0);
  const caloriesConsumedRef = useRef(0);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return toIsoDate(new Date());
  };

  // Load data on mount - check if we have today's data
  useEffect(() => {
    (async () => {
      try {
        const todayDate = getTodayDate();
        const result = await getMetrics(userId, todayDate);

        // Check if we have data for today AND it was created today
        const today = new Date().setHours(0, 0, 0, 0);
        const dataTimestamp = result?.timestamp ? new Date(result.timestamp).setHours(0, 0, 0, 0) : null;
        
        if (result && result.date === todayDate && dataTimestamp === today) {
          setSteps(result.steps || 0);
          setCaloriesBurned(result.caloriesBurned || 0);
          setCaloriesConsumed(result.caloriesConsumed || 0);
          setHeartRate(result.heartRate || 0);
          
          // Update refs
          stepsRef.current = result.steps || 0;
          caloriesBurnedRef.current = result.caloriesBurned || 0;
          caloriesConsumedRef.current = result.caloriesConsumed || 0;
        }
        // If no data for today or old data, start fresh at zero (already initialized)
      } catch (err) {
        console.error("Failed to load metrics:", err);
        // Start fresh at zero on error
      }
    })();
  }, [userId]);

  const loadRangeMetrics = useCallback(async () => {
    const today = new Date();
    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() - 29);

    const startDate = toIsoDate(startDateObj);
    const endDate = toIsoDate(today);

    try {
      const response = await getMetricsRange(userId, startDate, endDate);
      const rangeData = Array.isArray(response) ? response : response?.metrics;
      if (Array.isArray(rangeData) && rangeData.length > 0) {
        setRangeMetrics(rangeData);
        return;
      }
    } catch (error) {
      console.warn("Range metrics unavailable, using fallback trend data:", error);
    }

    setRangeMetrics(
      buildFallbackRangeData(
        stepsRef.current || 5200,
        caloriesBurnedRef.current || 320,
        caloriesConsumedRef.current || 1400,
      ),
    );
  }, [userId]);

  useEffect(() => {
    loadRangeMetrics();
  }, [loadRangeMetrics]);

  // Save current metrics to database (overwrites today's record)
  const saveMetrics = useCallback(async () => {
    const todayDate = getTodayDate();
    
    await updateMetrics(userId, {
      date: todayDate,
      steps: stepsRef.current,
      caloriesBurned: caloriesBurnedRef.current,
      caloriesConsumed: caloriesConsumedRef.current,
      heartRate: heartRate,
      timestamp: Date.now()
    });
  }, [heartRate, userId]);

  // Auto-save metrics every 60 seconds
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      try {
        await saveMetrics();
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(saveInterval);
  }, [saveMetrics]);

  // Save on window close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveMetrics]);

  // Stream new heart rate every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const liveData = await getHeartRate();
        const newHR = liveData.heartRate;
        setHeartRate(newHR);
        setHeartRateHistory((prev) => {
          const next = [
            ...prev,
            {
              minuteLabel: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}`,
              heartRate: newHR,
            },
          ];
          return next.slice(-40);
        });

        // Append slight fake increments to calories & steps for realism
        const stepsIncrement = Math.floor(Math.random() * 5);
        const caloriesIncrement = Math.floor(Math.random() * 2);
        
        const newSteps = stepsRef.current + stepsIncrement;
        const newCalories = caloriesBurnedRef.current + caloriesIncrement;

        // Update refs immediately
        stepsRef.current = newSteps;
        caloriesBurnedRef.current = newCalories;

        // Update state
        setSteps(newSteps);
        setCaloriesBurned(newCalories);
      } catch (err) {
        console.error("Heart rate stream failed:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle adding calories to consumed
  const handleAddCalories = async (additionalAmount) => {
    const newTotal = caloriesConsumed + additionalAmount;
    setCaloriesConsumed(newTotal);
    caloriesConsumedRef.current = newTotal;
    
    // Save immediately when user manually adds calories
    try {
      await saveMetrics();
    } catch (error) {
      console.error("Failed to save calories:", error);
      throw error;
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
  };

  const normalizedRange = useMemo(
    () =>
      rangeMetrics.length
        ? rangeMetrics
        : buildFallbackRangeData(steps || 5200, caloriesBurned || 320, caloriesConsumed || 1400),
    [rangeMetrics, steps, caloriesBurned, caloriesConsumed],
  );

  const weeklyRange = normalizedRange.slice(-7).map((entry) => ({
    ...entry,
    dayLabel: toDayLabel(entry.date),
    shortLabel: toShortDay(entry.date),
  }));

  const monthlyCalories = normalizedRange.map((entry) => {
    const burned = Number(entry.caloriesBurned || 0);
    const consumed = Number(entry.caloriesConsumed || 0);
    return {
      ...entry,
      dateLabel: toShortDate(entry.date),
      shortLabel: new Date(entry.date).getDate(),
      caloriesBurned: burned,
      caloriesConsumed: consumed,
      balance: consumed - burned,
      ratio: consumed > 0 ? burned / consumed : 0,
    };
  });

  const weeklyStepSeries = Array.from({ length: 7 }, (_, dayOffset) => {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (6 - dayOffset));
    const isToday = dayOffset === 6;
    return {
      dayLabel: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
      steps: isToday ? steps : 0,
    };
  });

  const yesterdaySteps = weeklyRange.length > 1 ? weeklyRange[weeklyRange.length - 2].steps : steps;
  const weeklyBurnAverage = weeklyRange.length
    ? weeklyRange.reduce((sum, day) => sum + (day.caloriesBurned || 0), 0) / weeklyRange.length
    : caloriesBurned;
  const heartRateAverage = heartRateHistory.length
    ? heartRateHistory.reduce((sum, point) => sum + point.heartRate, 0) / heartRateHistory.length
    : heartRate;
  const heartRateDelta =
    heartRateAverage > 0 ? ((heartRate - heartRateAverage) / heartRateAverage) * 100 : 0;

  const insights = {
    stepPace: "Previous days are zero until your AWS history is backfilled.",
    stepGoalStatus: `${Math.min((steps / 10000) * 100, 100).toFixed(0)}% of goal`,
    calorieTrend:
      caloriesConsumed - caloriesBurned > 0
        ? "Mostly in surplus this week"
        : "Mostly in deficit this week",
    weeklySteps: `${weeklyRange.reduce((sum, day) => sum + day.steps, 0).toLocaleString()} steps this week`,
    stepsDeltaDay: yesterdaySteps ? ((steps - yesterdaySteps) / yesterdaySteps) * 100 : 0,
    burnDeltaWeek: weeklyBurnAverage
      ? ((caloriesBurned - weeklyBurnAverage) / weeklyBurnAverage) * 100
      : 0,
    balanceDirection: caloriesConsumed - caloriesBurned >= 0 ? "Surplus" : "Deficit",
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "theme-dark" : ""}`} style={{ fontFamily: "DM Sans, sans-serif", backgroundColor: "var(--bg-app)" }}>
      {/* Header with Greeting and Profile */}
      <Header 
        userName={userName}
        userFullName={userFullName}
        greeting={getGreeting()} 
        onSignOut={onSignOut}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
      />

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 surface-premium h-full lg:min-h-[370px]">
              <div className="grid h-full grid-cols-1 md:grid-cols-3 gap-8">
                {/* Heart Rate */}
                <MetricsCard
                  icon={Heart}
                  label="Heart Rate"
                  value={heartRate}
                  unit="bpm"
                  color="text-red-500"
                  isFirst={true}
                  progress={Math.min((heartRate / 160) * 100, 100)}
                  deltaLabel={`${heartRateDelta > 0 ? "+" : ""}${heartRateDelta.toFixed(0)}% vs avg`}
                  ringColor="#e11d48"
                />

                {/* Steps */}
                <MetricsCard
                  icon={Footprints}
                  label="Steps"
                  value={steps}
                  unit="steps"
                  color="text-blue-500"
                  progress={Math.min((steps / 10000) * 100, 100)}
                  deltaLabel={`${insights.stepsDeltaDay > 0 ? "+" : ""}${insights.stepsDeltaDay.toFixed(0)}% vs yesterday`}
                  ringColor="#2563eb"
                />

                <MetricsCard
                  icon={Flame}
                  label="Calories Burned"
                  value={caloriesBurned}
                  unit="kcal"
                  color="text-orange-500"
                  isLast={true}
                  progress={Math.min((caloriesBurned / 500) * 100, 100)}
                  deltaLabel={`${caloriesConsumed - caloriesBurned >= 0 ? "+" : ""}${caloriesConsumed - caloriesBurned} net`}
                  ringColor="#f59e0b"
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <CaloriesConsumedCard 
              caloriesConsumed={caloriesConsumed} 
              onUpdate={handleAddCalories}
              className="h-full lg:min-h-[370px]"
            />
          </div>
        </div>

        {/* Goal Progress - Full Width */}
        <GoalProgress 
          steps={steps}
          caloriesBurned={caloriesBurned}
          caloriesConsumed={caloriesConsumed}
        />

        <ModernMetricsSection
          weeklyStepSeries={weeklyStepSeries}
          weeklySteps={weeklyRange}
          monthlyCalories={monthlyCalories}
          heartRateHistory={heartRateHistory}
          insights={insights}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
