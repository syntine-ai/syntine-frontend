import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Bot,
  Check,
  Clock,
  Copy,
  Info,
  Link2,
  Loader2,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { ConfigHealth } from "@/components/agents/AgentConfigPanel";

interface AgentTopBarProps {
  mode: "create" | "edit" | "view";
  name: string;
  onNameChange?: (name: string) => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  // Config health
  configHealth?: { status: ConfigHealth; label: string };
  // Metadata (for popover)
  agentId?: string;
  agentStatus?: string;
  linkedCampaigns?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function AgentTopBar({
  mode,
  name,
  onNameChange,
  isSaving = false,
  hasUnsavedChanges = false,
  onSave,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
  onEdit,
  configHealth,
  agentId,
  agentStatus,
  linkedCampaigns = 0,
  createdAt,
  updatedAt,
}: AgentTopBarProps) {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(mode === "create");
  const [localName, setLocalName] = useState(name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleNameBlur = () => {
    if (mode !== "view" && onNameChange) {
      onNameChange(localName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameBlur();
    if (e.key === "Escape") {
      setLocalName(name);
      setIsEditingName(false);
    }
  };

  const healthDotClass =
    configHealth?.status === "ready"
      ? "bg-success"
      : configHealth?.status === "warning"
        ? "bg-warning"
        : "bg-destructive";

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Back + Name + Health */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/agents")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Agents
            </Button>

            <div className="h-5 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>

              {mode === "view" || !isEditingName ? (
                <div
                  className={`flex items-center gap-2 ${mode !== "view" ? "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1" : ""}`}
                  onClick={() => mode !== "view" && setIsEditingName(true)}
                >
                  <h1 className="text-lg font-semibold text-foreground leading-none">
                    {name || "Untitled Agent"}
                  </h1>
                  {mode !== "view" && (
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ) : (
                <Input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Agent name"
                  className="text-lg font-semibold h-auto py-1 px-2 w-64"
                  autoFocus
                />
              )}

              {/* Metadata Popover */}
              {agentId && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Info className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Agent ID</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono block truncate">
                          {agentId}
                        </code>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                          <Link2 className="h-3 w-3" /> Linked Campaigns
                        </p>
                        <p className="font-medium">{linkedCampaigns}</p>
                      </div>
                      {createdAt && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Created
                          </p>
                          <p className="text-xs">{format(new Date(createdAt), "MMM d, yyyy")}</p>
                        </div>
                      )}
                      {updatedAt && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Last Updated
                          </p>
                          <p className="text-xs">{format(new Date(updatedAt), "MMM d, yyyy h:mm a")}</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-warning border-warning/40 text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Health + Actions */}
          <div className="flex items-center gap-3">
            {/* Config Health Indicator */}
            {configHealth && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                <span className={`h-2 w-2 rounded-full ${healthDotClass}`} />
                <span>{configHealth.label}</span>
              </div>
            )}

            {mode === "create" && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/agents")}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSave} disabled={isSaving || !name.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-3.5 w-3.5" />
                      Create Agent
                    </>
                  )}
                </Button>
              </>
            )}

            {mode === "edit" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                {agentStatus === "active" ? (
                  <Button variant="outline" size="sm" onClick={onUnpublish}>
                    <Pause className="mr-2 h-3.5 w-3.5" />
                    Unpublish
                  </Button>
                ) : (
                  <Button size="sm" onClick={onPublish}>
                    <Play className="mr-2 h-3.5 w-3.5" />
                    Publish
                  </Button>
                )}
              </>
            )}

            {mode === "view" && (
              <Button size="sm" onClick={onEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </Button>
            )}

            {(mode === "edit" || mode === "view") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
              Any campaigns using this agent will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
