import { Flame} from "lucide-react";
import { Card } from "./ui/Card";

export default function CaloriesBurnedCard({ caloriesBurned }) {
  return (
    <Card className="p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-light">Calories Burned</p>
            <p className="text-3xl font-light text-gray-900">{caloriesBurned.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">kcal</div>
      </div>
    </Card>
  );
}
