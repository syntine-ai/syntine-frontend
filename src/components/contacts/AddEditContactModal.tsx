import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Loader2 } from "lucide-react";
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
import type { ContactListWithCount } from "@/hooks/useContacts";

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
  contactLists?: ContactListWithCount[];
  onSubmit?: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    tags?: string;
    contactListId?: string;
    doNotCall?: boolean;
  }) => Promise<void>;
}

export function AddEditContactModal({
  open,
  onOpenChange,
  contact,
  mode = "add",
  contactLists = [],
  onSubmit,
}: AddEditContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    tags: "",
    contactList: "",
    doNotCall: false,
  });

  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        phone: contact.phone || "",
        email: contact.email || "",
        tags: contact.tags || "",
        contactList: contact.contactList || "",
        doNotCall: contact.doNotCall || false,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        tags: "",
        contactList: "",
        doNotCall: false,
      });
    }
  }, [contact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined,
          tags: formData.tags || undefined,
          contactListId: formData.contactList || undefined,
          doNotCall: formData.doNotCall,
        });
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
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

          {!isEditing && (
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
                  {contactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save Contact"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
