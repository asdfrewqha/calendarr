import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export default function Calendar({ selected, onSelect }: CalendarProps) {
  return (
    <div className="p-2">
      <DayPicker mode="single" selected={selected} onSelect={onSelect} />
    </div>
  );
}
