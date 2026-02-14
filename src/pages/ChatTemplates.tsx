import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { demoChatTemplates } from "@/data/demoChatData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
};

export default function ChatTemplates() {
  return (
    <PageContainer
      title="Templates"
      subtitle="Manage chat message templates"
      actions={
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      }
    >
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variables</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoChatTemplates.map((tpl) => (
              <TableRow key={tpl.id} className="table-row-hover cursor-pointer">
                <TableCell className="font-medium text-foreground">{tpl.name}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{tpl.category}</TableCell>
                <TableCell className="text-muted-foreground">{tpl.language.toUpperCase()}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusColors[tpl.status] || "badge-neutral")}>
                    {tpl.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{tpl.variables.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
