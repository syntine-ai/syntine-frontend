import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Eye, Pencil, ListPlus, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SentimentBadge } from "./SentimentBadge";
import { OutcomePill } from "./OutcomePill";
import { StatusPill } from "@/components/shared/StatusPill";
import { cn } from "@/lib/utils";

export interface Contact {
  id: number;
  name: string;
  phone: string;
  contactList: string;
  lastCampaign: string;
  lastCallDate: string;
  sentiment: "positive" | "neutral" | "negative";
  outcome: "answered" | "no_answer" | "busy" | "failed";
  status: "active" | "inactive" | "draft";
  doNotCall?: boolean;
}

interface ContactsTableProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onAssignToList?: (contact: Contact) => void;
  onMarkDNC?: (contact: Contact) => void;
}

export function ContactsTable({
  contacts,
  onContactClick,
  onEdit,
  onAssignToList,
  onMarkDNC,
}: ContactsTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const isAllSelected = selectedIds.length === contacts.length && contacts.length > 0;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 bg-primary/10 border-b border-border flex items-center gap-3"
        >
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ListPlus className="h-3.5 w-3.5" />
              Assign to List
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              Remove from List
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
              <Ban className="h-3.5 w-3.5" />
              Mark Do Not Call
            </Button>
            <Button size="sm" variant="destructive" className="gap-1.5">
              Delete
            </Button>
          </div>
        </motion.div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement).dataset.indeterminate = isSomeSelected ? "true" : "false";
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">Name</TableHead>
            <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
            <TableHead className="text-muted-foreground font-medium">Contact List</TableHead>
            <TableHead className="text-muted-foreground font-medium">Last Campaign</TableHead>
            <TableHead className="text-muted-foreground font-medium">Last Call</TableHead>
            <TableHead className="text-muted-foreground font-medium">Sentiment</TableHead>
            <TableHead className="text-muted-foreground font-medium">Outcome</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => (
            <motion.tr
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onContactClick(contact)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/30 border-b border-border",
                contact.doNotCall && "opacity-60"
              )}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(contact.id)}
                  onCheckedChange={() => handleSelectOne(contact.id)}
                />
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {contact.name}
                  {contact.doNotCall && (
                    <span className="text-xs px-1.5 py-0.5 bg-destructive/15 text-destructive rounded">
                      DNC
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
              <TableCell className="text-muted-foreground">{contact.contactList}</TableCell>
              <TableCell className="text-muted-foreground">{contact.lastCampaign}</TableCell>
              <TableCell className="text-muted-foreground">{contact.lastCallDate}</TableCell>
              <TableCell>
                <SentimentBadge sentiment={contact.sentiment} />
              </TableCell>
              <TableCell>
                <OutcomePill outcome={contact.outcome} />
              </TableCell>
              <TableCell>
                <StatusPill status={contact.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                    <DropdownMenuItem onClick={() => onContactClick(contact)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(contact)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignToList?.(contact)} className="gap-2">
                      <ListPlus className="h-4 w-4" />
                      Assign to List
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMarkDNC?.(contact)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Ban className="h-4 w-4" />
                      Mark DNC
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
