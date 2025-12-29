import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddEditContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    tags?: string;
    contactList?: string;
    doNotCall?: boolean;
  };
  mode?: "add" | "edit";
}

export function AddEditContactModal({
  open,
  onOpenChange,
  contact,
  mode = "add",
}: AddEditContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    phone: contact?.phone || "",
    email: contact?.email || "",
    tags: contact?.tags || "",
    contactList: contact?.contactList || "",
    doNotCall: contact?.doNotCall || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      mode === "add" ? "Contact added successfully" : "Contact updated successfully",
      {
        description: `${formData.firstName} ${formData.lastName} has been ${mode === "add" ? "added" : "updated"}.`,
      }
    );
    onOpenChange(false);
  };

  const isEditing = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Contact" : "Add Contact"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5 mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags <span className="text-muted-foreground">(comma-separated)</span>
            </Label>
            <Input
              id="tags"
              placeholder="lead, priority, Q1"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactList" className="text-sm font-medium">
              Initial Contact List
            </Label>
            <Select
              value={formData.contactList}
              onValueChange={(value) =>
                setFormData({ ...formData, contactList: value })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="leads-jan">Leads - Jan</SelectItem>
                <SelectItem value="hot-prospects">Hot Prospects</SelectItem>
                <SelectItem value="re-engagement">Re-engagement</SelectItem>
                <SelectItem value="new-signups">New Signups</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="doNotCall"
              checked={formData.doNotCall}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, doNotCall: checked as boolean })
              }
            />
            <Label
              htmlFor="doNotCall"
              className="text-sm font-medium cursor-pointer text-muted-foreground"
            >
              Mark as Do Not Call
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Save Contact"}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
