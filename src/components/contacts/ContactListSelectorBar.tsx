import { motion } from "framer-motion";
import { Upload, Plus, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactListWithCount } from "@/hooks/useContacts";

interface ContactListSelectorBarProps {
  selectedList: string;
  onListChange: (value: string) => void;
  onImportClick: () => void;
  onCreateListClick: () => void;
  contactLists?: ContactListWithCount[];
  totalCount?: number;
}

export function ContactListSelectorBar({
  selectedList,
  onListChange,
  onImportClick,
  onCreateListClick,
  contactLists = [],
  totalCount = 0,
}: ContactListSelectorBarProps) {
  // Build options with "All Contacts" at the top
  const allContactsOption = { value: "all", label: "All Contacts", count: totalCount };
  const listOptions = contactLists.map((list) => ({
    value: list.id,
    label: list.name,
    count: list.contactCount,
  }));
  const options = [allContactsOption, ...listOptions];

  const selectedOption = options.find((o) => o.value === selectedList);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg mb-4"
    >
      <div className="flex items-center gap-3">
        <ListFilter className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedList} onValueChange={onListChange}>
          <SelectTrigger className="w-[220px] bg-background border-border">
            <SelectValue placeholder="Select a list" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {options.map((list) => (
              <SelectItem key={list.value} value={list.value}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span>{list.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {list.count.toLocaleString()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedOption && (
          <span className="text-sm text-muted-foreground">
            {selectedOption.count.toLocaleString()} contacts
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCreateListClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create List
        </Button>
        <Button onClick={onImportClick} className="gap-2">
          <Upload className="h-4 w-4" />
          Import Contacts
        </Button>
      </div>
    </motion.div>
  );
}
