import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDownIcon } from "lucide-react";

export type DaysListItem = {
  value: string;
  label: string;
};

export type ExpenseRecordsFilterProps = {
  selectedDate: DaysListItem;
  setSelectedDate: (date: DaysListItem) => void;
};

export const lastSevenDays: DaysListItem[] = Array.from(
  { length: 7 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label =
      i == 0
        ? "Today"
        : i == 1
        ? "Yesterday"
        : "Last " +
          date.toLocaleDateString("en-IN", {
            weekday: "long",
          });

    return {
      value: date.toLocaleDateString("en-IN"),
      label,
    };
  }
);

const ExpenseRecordsFilter = (props: ExpenseRecordsFilterProps) => {
  const { selectedDate, setSelectedDate } = props;

  return (
    <section className="flex justify-end items-center w-full">
      <DropdownMenu>
        <DropdownMenuTrigger className="border border-gray-500 dark:border-white p-1 px-2 rounded-md flex items-center">
          <span>{selectedDate.label}</span>
          <ChevronsUpDownIcon className="h-4 w-4 ml-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {lastSevenDays.map((day) => (
            <DropdownMenuItem
              key={day.value}
              //   className="lowercase"
              onClick={() => {
                setSelectedDate(day);
              }}
            >
              {day.label}
              {selectedDate.value === day.value && (
                <span className="ml-2">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
};

export default ExpenseRecordsFilter;
