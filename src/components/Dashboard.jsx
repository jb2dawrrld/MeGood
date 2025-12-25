import { useEffect, useState, useRef } from "react";
import { getMetrics, getHeartRate, updateMetrics } from "../api/metrics";
import { Card } from "./ui/Card";
import { Heart, Footprints } from "lucide-react";
import Header from "./Header";
import MetricsCard from "./MetricsCard";
import CaloriesConsumedCard from "./CaloriesConsumedCard";
import CaloriesBurnedCard from "./CaloriesBurnedCard";
import GoalProgress from "./GoalProgress";

export default function Dashboard({ userName, userFullName, userId, onSignOut }) {
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  
  // Use refs to track latest values for use in interval callback
  const stepsRef = useRef(0);
  const caloriesBurnedRef = useRef(0);
  const caloriesConsumedRef = useRef(0);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
  }, []);

  // Save on window close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Save current metrics to database (overwrites today's record)
  const saveMetrics = async () => {
    const todayDate = getTodayDate();
    
    await updateMetrics(userId, {
      date: todayDate,
      steps: stepsRef.current,
      caloriesBurned: caloriesBurnedRef.current,
      caloriesConsumed: caloriesConsumedRef.current,
      heartRate: heartRate,
      timestamp: Date.now()
    });
  };

  // Stream new heart rate every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const liveData = await getHeartRate();
        const newHR = liveData.heartRate;
        setHeartRate(newHR);

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
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header with Greeting and Profile */}
        <Header 
          userName={userName}
          userFullName={userFullName}
          greeting={getGreeting()} 
          onSignOut={onSignOut}
        />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Heart Rate and Steps (2 rows) */}
          <div className="col-span-2 space-y-6">
            {/* Metrics Bar - Only Heart Rate and Steps */}
            <Card className="p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-8">
                {/* Heart Rate */}
                <MetricsCard
                  icon={Heart}
                  label="Heart Rate"
                  value={heartRate}
                  unit="bpm"
                  color="text-red-500"
                  isFirst={true}
                />

                {/* Steps */}
                <MetricsCard
                  icon={Footprints}
                  label="Steps"
                  value={steps}
                  unit="steps"
                  color="text-blue-500"
                  isLast={true}
                />
              </div>
            </Card>

            {/* Calories Burned Card */}
            <CaloriesBurnedCard caloriesBurned={caloriesBurned} />
          </div>

          {/* Right Column: Calories Consumed Card */}
          <div>
            <CaloriesConsumedCard 
              caloriesConsumed={caloriesConsumed} 
              onUpdate={handleAddCalories}
            />
          </div>
        </div>

        {/* Goal Progress - Full Width */}
        <GoalProgress 
          steps={steps}
          caloriesBurned={caloriesBurned}
          caloriesConsumed={caloriesConsumed}
        />
      </div>
    </div>
  );
}