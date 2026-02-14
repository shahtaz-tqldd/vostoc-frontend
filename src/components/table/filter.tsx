import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import { DatePickerInput } from "../custom-input/date-picker";

type Option = { label: string; value: string };

export type FilterSelect = {
  id: string;
  value: string;
  placeholder?: string;
  options: Option[];
  onChange: (v: string) => void;
  widthClassName?: string; // e.g. "w-[180px]"
};

export type FilterDate = {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  widthClassName?: string;
  min?: string;
  max?: string;
};

type FilterBarProps = {
  search?: {
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
  };
  selects?: FilterSelect[];
  date?: FilterDate;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

export function FilterBar({
  search,
  selects,
  date,
  onReset,
  resetLabel = "Reset",
  className = "",
}: FilterBarProps) {
  const showReset = Boolean(onReset);

  return (
    <div className={`flex flex-wrap items-center gap-2 mr-6 ${className}`}>
      {search && (
        <div className="relative">
          <Input
            value={search.value}
            placeholder={search.placeholder ?? "Search..."}
            onChange={(e) => search.onChange(e.target.value)}
            className="h-9 !w-[260px] !pl-8"
          />
          <Search
            size={14}
            className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
          />
        </div>
      )}

      {selects?.map((select) => {
        const activeOption = select.options.find(
          (option) => option.value === select.value,
        );

        return (
          <DropdownMenu key={select.id}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`h-9 justify-between rounded-xl bg-white px-2.5 font-normal ${select.widthClassName ?? "!w-[180px]"}`}
              >
                <span className="truncate">
                  {activeOption?.label ?? select.placeholder ?? "Filter"}
                </span>
                <ChevronDown size={16} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={select.value}
                onValueChange={select.onChange}
              >
                {select.options.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {date && (
        <DatePickerInput
          id={date.id}
          value={date.value}
          min={date.min}
          max={date.max}
          placeholder={date.placeholder ?? "Date"}
          onChange={date.onChange}
          className={`h-9 ${date.widthClassName ?? "!w-[180px]"}`}
        />
      )}

      {showReset && (
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={onReset}
        >
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
