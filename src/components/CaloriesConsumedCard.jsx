import { useState } from "react";
import {UtensilsCrossed } from "lucide-react";
import { Card } from "./ui/Card";

export default function CaloriesConsumedCard({ caloriesConsumed, onUpdate, className = "" }) {
  const [additionalCalories, setAdditionalCalories] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddCalories = async () => {
    const amount = parseInt(additionalCalories);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid calorie amount");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(amount);
      setAdditionalCalories("");
    } catch (error) {
      console.error("Failed to update calories:", error);
      alert("Failed to add calories. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`p-8 surface-premium ${className}`}>
      <div className="flex h-full flex-col items-center gap-4">
        {/* Icon and Label */}
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-green-600" />
        </div>
        <span className="font-light text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Cal Count
        </span>
        

        {/* Calorie Value */}
        <div className="text-5xl font-light" style={{ color: "var(--text-primary)" }}>
          {caloriesConsumed.toLocaleString()}
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>kcal</div>

        {/* Add Calories Section */}
        <div className="mt-auto w-full max-w-xs space-y-3 pt-6">
          <input
            type="number"
            value={additionalCalories}
            onChange={(e) => setAdditionalCalories(e.target.value)}
            placeholder="Add calories..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
            disabled={isUpdating}
          />
          <button
            onClick={handleAddCalories}
            disabled={isUpdating || !additionalCalories}
            className="w-full px-6 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isUpdating ? "Updating..." : "Add More Calories"}
          </button>
        </div>
      </div>
    </Card>
  );
}
