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

interface ContactListSelectorBarProps {
  selectedList: string;
  onListChange: (value: string) => void;
  onImportClick: () => void;
  onCreateListClick: () => void;
}

const contactLists = [
  { value: "all", label: "All Contacts", count: 12480 },
  { value: "leads-jan", label: "Leads - Jan", count: 2340 },
  { value: "hot-prospects", label: "Hot Prospects", count: 856 },
  { value: "re-engagement", label: "Re-engagement", count: 1245 },
  { value: "vip-customers", label: "VIP Customers", count: 432 },
];

export function ContactListSelectorBar({
  selectedList,
  onListChange,
  onImportClick,
  onCreateListClick,
}: ContactListSelectorBarProps) {
  const selectedListData = contactLists.find((l) => l.value === selectedList);

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
            {contactLists.map((list) => (
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
        {selectedListData && (
          <span className="text-sm text-muted-foreground">
            {selectedListData.count.toLocaleString()} contacts
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
