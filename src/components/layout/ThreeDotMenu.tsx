import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

export type ThreeDotMenuItem = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  destructive?: boolean;
  disabled?: boolean;
};

type ThreeDotMenuProps = {
  items: ThreeDotMenuItem[];
  label?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
};

const ThreeDotMenu = ({
  items,
  label = "Actions",
  align = "end",
  triggerClassName = "h-8 w-8 !p-0",
}: ThreeDotMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className={triggerClassName}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              variant={item.destructive ? "destructive" : "default"}
              className="text-sm font-medium text-gray-600"
            >
              {Icon ? <Icon className="mr-1 !h-3.5 !w-3.5" /> : null}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreeDotMenu;
