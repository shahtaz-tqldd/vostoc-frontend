import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Option = { label: string; value: string };

export type FilterSelect = {
  id: string;
  value: string;
  placeholder?: string;
  options: Option[];
  onChange: (v: string) => void;
  widthClassName?: string; // e.g. "w-[180px]"
};

type FilterBarProps = {
  search?: {
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
  };
  selects?: FilterSelect[];
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

export function FilterBar({
  search,
  selects,
  onReset,
  resetLabel = "Reset",
  className = "",
}: FilterBarProps) {
  const showReset = Boolean(onReset);

  return (
    <div className={`flex flex-wrap items-center gap-2 mr-6 ${className}`}>
      {search && (
        <Input
          value={search.value}
          placeholder={search.placeholder ?? "Search..."}
          onChange={(e) => search.onChange(e.target.value)}
          className="h-9 !w-[220px]"
        />
      )}

      {selects?.map((select) => (
        <Select
          key={select.id}
          value={select.value}
          onValueChange={select.onChange}
        >
          <SelectTrigger
            className={`h-9 ${select.widthClassName ?? "!w-[180px]"}`}
          >
            <SelectValue placeholder={select.placeholder ?? "Filter"} />
          </SelectTrigger>
          <SelectContent>
            {select.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

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
