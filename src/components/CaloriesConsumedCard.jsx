import { useState } from "react";
import {UtensilsCrossed } from "lucide-react";
import { Card } from "./ui/Card";

export default function CaloriesConsumedCard({ caloriesConsumed, onUpdate }) {
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
    <Card className="p-8 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        {/* Icon and Label */}
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-green-600" />
        </div>
        <span className="font-light text-gray-600 text-sm uppercase tracking-wider">
          Cal Count
        </span>
        

        {/* Calorie Value */}
        <div className="text-5xl font-light text-gray-900">
          {caloriesConsumed.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">kcal</div>

        {/* Add Calories Section */}
        <div className="mt-4 w-full max-w-xs space-y-3">
          <input
            type="number"
            value={additionalCalories}
            onChange={(e) => setAdditionalCalories(e.target.value)}
            placeholder="Add calories..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isUpdating}
          />
          <button
            onClick={handleAddCalories}
            disabled={isUpdating || !additionalCalories}
            className="w-full px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isUpdating ? "Updating..." : "Add More Calories"}
          </button>
        </div>
      </div>
    </Card>
  );
}
