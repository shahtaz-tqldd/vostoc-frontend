import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

type DatePickerInputProps = {
  id?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
};

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function parseDateValue(value?: string) {
  if (!value) {
    return undefined;
  }
  const date = new Date(`${value}T00:00:00`);
  return isValidDate(date) ? date : undefined;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePickerInput({
  id,
  value,
  placeholder,
  onChange,
  className,
  min,
  max,
  disabled,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const date = React.useMemo(() => parseDateValue(value), [value]);
  const [month, setMonth] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    if (date) {
      setMonth(date);
    }
  }, [date]);

  return (
    <Field className={className}>
      <InputGroup className="h-9 bg-white rounded-xl">
        <InputGroupInput
          id={id}
          value={formatDate(date)}
          placeholder={placeholder ?? "Select date"}
          readOnly
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id={id ? `${id}-picker` : "date-picker"}
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
                disabled={disabled}
              >
                <CalendarIcon size={16} className="opacity-60" />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0 bg-white"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                className="bg-white"
                disabled={(d) => {
                  if (min && d < new Date(`${min}T00:00:00`)) {
                    return true;
                  }
                  if (max && d > new Date(`${max}T23:59:59`)) {
                    return true;
                  }
                  return false;
                }}
                onSelect={(date) => {
                  if (!date) {
                    return;
                  }
                  onChange?.(formatDateValue(date));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
