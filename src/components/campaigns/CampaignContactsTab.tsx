import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link as LinkIcon, RefreshCw } from "lucide-react";

interface ContactList {
  id: string;
  name: string;
  size: number;
  lastSync: string;
  status: "synced" | "syncing" | "error";
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  tag: string;
}

const mockContactLists: ContactList[] = [
  { id: "1", name: "Q4 Renewals", size: 2340, lastSync: "2 hours ago", status: "synced" },
  { id: "2", name: "High Value Leads", size: 890, lastSync: "1 day ago", status: "synced" },
];

const previewContacts: Contact[] = [
  { id: "1", name: "John Smith", phone: "+1 555-0123", tag: "VIP" },
  { id: "2", name: "Sarah Johnson", phone: "+1 555-0456", tag: "New" },
  { id: "3", name: "Mike Brown", phone: "+1 555-0789", tag: "Renewal" },
  { id: "4", name: "Emily Davis", phone: "+1 555-0321", tag: "VIP" },
  { id: "5", name: "Chris Wilson", phone: "+1 555-0654", tag: "Lead" },
  { id: "6", name: "Lisa Anderson", phone: "+1 555-0987", tag: "Renewal" },
  { id: "7", name: "David Lee", phone: "+1 555-0147", tag: "New" },
  { id: "8", name: "Amy Chen", phone: "+1 555-0258", tag: "VIP" },
];

const statusConfig = {
  synced: { label: "Synced", className: "bg-success/15 text-success" },
  syncing: { label: "Syncing...", className: "bg-warning/15 text-warning" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive" },
};

export function CampaignContactsTab() {
  return (
    <div className="space-y-6">
      {/* Contact Lists */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Linked Contact Lists</CardTitle>
              <CardDescription>Contact lists attached to this campaign</CardDescription>
            </div>
            <Button variant="outline">
              <LinkIcon className="h-4 w-4 mr-2" />
              Attach Contact List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockContactLists.map((list, index) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{list.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {list.size.toLocaleString()} contacts • Last sync: {list.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={statusConfig[list.status].className}>
                    {statusConfig[list.status].label}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Preview */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Contact Preview</CardTitle>
          <CardDescription>Sample contacts from linked lists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Tag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-border/50"
                  >
                    <TableCell className="font-medium text-foreground">{contact.name}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {contact.tag}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
