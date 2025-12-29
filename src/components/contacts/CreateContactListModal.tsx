import { useState } from "react";
import { motion } from "framer-motion";
import { ListPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateContactListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContactListModal({
  open,
  onOpenChange,
}: CreateContactListModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "static",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Contact list created", {
      description: `"${formData.name}" has been created successfully.`,
    });
    onOpenChange(false);
    setFormData({ name: "", type: "static", description: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ListPlus className="h-5 w-5 text-primary" />
            Create Contact List
          </DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              List Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Leads, VIP Customers"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              List Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="static">
                  <div className="flex flex-col">
                    <span>Static</span>
                    <span className="text-xs text-muted-foreground">
                      Manually add and remove contacts
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="dynamic">
                  <div className="flex flex-col">
                    <span>Dynamic</span>
                    <span className="text-xs text-muted-foreground">
                      Auto-populate based on filters
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this list..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-background min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create List</Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
