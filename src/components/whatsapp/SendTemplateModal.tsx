import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/api/services/chat.service";
import { FileText, Send } from "lucide-react";

interface SendTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (templateName: string, variables: Record<string, string>) => void;
}

export function SendTemplateModal({ open, onClose, onSend }: SendTemplateModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({});

  const { data: templates = [] } = useQuery({
    queryKey: ["chat-templates"],
    queryFn: chatService.getTemplates
  });

  const approved = (templates as any[]).filter((t: any) => t.status === "approved");
  const template = approved.find((t) => t.id === selectedId);

  const preview = useMemo(() => {
    if (!template) return "";
    let body = template.body;
    template.variables.forEach((v, i) => {
      body = body.replace(`{{${i + 1}}}`, variables[v] || `{{${v}}}`);
    });
    return body;
  }, [template, variables]);

  const handleSend = () => {
    if (!template) return;
    onSend(template.name, variables);
    setSelectedId("");
    setVariables({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(var(--success))]" />
            Send Template
          </DialogTitle>
          <DialogDescription>Select an approved template and fill in the variables.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setVariables({}); }}>
              <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
              <SelectContent>
                {approved.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {template && (
            <>
              <div className="space-y-2">
                <Label>Variables</Label>
                {template.variables.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{v}</span>
                    <Input
                      className="h-8 text-sm"
                      placeholder={v}
                      value={variables[v] || ""}
                      onChange={(e) => setVariables((prev) => ({ ...prev, [v]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Preview</Label>
                <div className="rounded-2xl rounded-br-sm bg-[hsl(var(--success))]/15 px-4 py-3 text-sm text-foreground">
                  {preview}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!template} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Send Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
