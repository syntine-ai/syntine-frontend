import { motion } from "framer-motion";
import { MoreHorizontal, Eye, Pencil, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusPill } from "@/components/shared/StatusPill";

export interface ContactList {
  id: number;
  name: string;
  totalContacts: number;
  lastUpdated: string;
  linkedCampaigns: number;
  status: "active" | "inactive" | "draft";
  type: "static" | "dynamic";
}

interface ContactListsTableProps {
  lists: ContactList[];
  onListClick: (list: ContactList) => void;
  onRename?: (list: ContactList) => void;
  onDelete?: (list: ContactList) => void;
}

export function ContactListsTable({
  lists,
  onListClick,
  onRename,
  onDelete,
}: ContactListsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-muted-foreground font-medium">List Name</TableHead>
            <TableHead className="text-muted-foreground font-medium">Total Contacts</TableHead>
            <TableHead className="text-muted-foreground font-medium">Last Updated</TableHead>
            <TableHead className="text-muted-foreground font-medium">Linked Campaigns</TableHead>
            <TableHead className="text-muted-foreground font-medium">Type</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((list, index) => (
            <motion.tr
              key={list.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onListClick(list)}
              className="cursor-pointer transition-colors hover:bg-muted/30 border-b border-border"
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  {list.name}
                </div>
              </TableCell>
              <TableCell className="text-foreground font-medium">
                {list.totalContacts.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">{list.lastUpdated}</TableCell>
              <TableCell className="text-muted-foreground">
                {list.linkedCampaigns} campaign{list.linkedCampaigns !== 1 ? "s" : ""}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                  {list.type === "static" ? "Static" : "Dynamic"}
                </span>
              </TableCell>
              <TableCell>
                <StatusPill status={list.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                    <DropdownMenuItem onClick={() => onListClick(list)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRename?.(list)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(list)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
