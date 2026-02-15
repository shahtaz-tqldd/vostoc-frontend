import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
};

const DeleteDialog = ({
  open,
  onOpenChange,
  title = "Delete item",
  description,
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
}: DeleteDialogProps) => {
  const fallbackDescription = itemName
    ? `This will permanently delete ${itemName}. This action cannot be undone.`
    : "This action cannot be undone.";

  return (
    <Dialog open={Boolean(open)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3.5">
            <Trash2 className="text-red-500" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ?? fallbackDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700 !border-none"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
