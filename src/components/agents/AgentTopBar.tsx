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
   ArrowLeft,
   Bot,
   Check,
   CheckCircle2,
   Copy,
   Loader2,
   MoreVertical,
   Pause,
   Pencil,
   Play,
   Trash2,
 } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import type { Database } from "@/integrations/supabase/types";
 
 type AgentStatus = Database["public"]["Enums"]["agent_status"];
 
 interface AgentTopBarProps {
   mode: "create" | "edit" | "view";
   name: string;
   onNameChange?: (name: string) => void;
   status: AgentStatus;
   isSaving?: boolean;
   hasUnsavedChanges?: boolean;
   onSave?: () => void;
   onPublish?: () => void;
   onUnpublish?: () => void;
   onDuplicate?: () => void;
   onDelete?: () => void;
   onEdit?: () => void;
 }
 
 export function AgentTopBar({
   mode,
   name,
   onNameChange,
   status,
   isSaving = false,
   hasUnsavedChanges = false,
   onSave,
   onPublish,
   onUnpublish,
   onDuplicate,
   onDelete,
   onEdit,
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
     if (e.key === "Enter") {
       handleNameBlur();
     }
     if (e.key === "Escape") {
       setLocalName(name);
       setIsEditingName(false);
     }
   };
 
   const getStatusBadge = () => {
     switch (status) {
       case "active":
         return (
           <Badge className="bg-success/15 text-success border-success/40 border gap-1">
             <CheckCircle2 className="h-3 w-3" />
             Active
           </Badge>
         );
       case "inactive":
         return (
           <Badge className="bg-warning/15 text-warning border-warning/40 border gap-1">
             <Pause className="h-3 w-3" />
             Paused
           </Badge>
         );
       case "draft":
       default:
         return (
           <Badge variant="outline" className="text-muted-foreground gap-1">
             Draft
           </Badge>
         );
     }
   };
 
   return (
     <>
       <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
         <div className="flex items-center justify-between px-6 py-4">
           {/* Left: Back + Name + Status */}
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
 
             <div className="h-6 w-px bg-border" />
 
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Bot className="h-5 w-5 text-primary" />
               </div>
 
               {mode === "view" || !isEditingName ? (
                 <div
                   className={`flex items-center gap-2 ${mode !== "view" ? "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1" : ""}`}
                   onClick={() => mode !== "view" && setIsEditingName(true)}
                 >
                   <h1 className="text-xl font-semibold text-foreground">
                     {name || "Untitled Agent"}
                   </h1>
                   {mode !== "view" && (
                     <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                   )}
                 </div>
               ) : (
                 <Input
                   value={localName}
                   onChange={(e) => setLocalName(e.target.value)}
                   onBlur={handleNameBlur}
                   onKeyDown={handleNameKeyDown}
                   placeholder="Agent name"
                   className="text-xl font-semibold h-auto py-1 px-2 w-64"
                   autoFocus
                 />
               )}
 
               {getStatusBadge()}
 
               {hasUnsavedChanges && (
                 <Badge variant="outline" className="text-warning border-warning/40">
                   Unsaved
                 </Badge>
               )}
             </div>
           </div>
 
           {/* Right: Actions */}
           <div className="flex items-center gap-2">
             {mode === "create" && (
               <>
                 <Button variant="outline" onClick={() => navigate("/agents")}>
                   Cancel
                 </Button>
                 <Button onClick={onSave} disabled={isSaving || !name.trim()}>
                   {isSaving ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Creating...
                     </>
                   ) : (
                     <>
                       <Check className="mr-2 h-4 w-4" />
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
                   onClick={onSave}
                   disabled={isSaving || !hasUnsavedChanges}
                 >
                   {isSaving ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Saving...
                     </>
                   ) : (
                     "Save Changes"
                   )}
                 </Button>
 
                 {status === "active" ? (
                   <Button variant="outline" onClick={onUnpublish}>
                     <Pause className="mr-2 h-4 w-4" />
                     Unpublish
                   </Button>
                 ) : (
                   <Button onClick={onPublish}>
                     <Play className="mr-2 h-4 w-4" />
                     Publish
                   </Button>
                 )}
               </>
             )}
 
             {mode === "view" && (
               <Button onClick={onEdit}>
                 <Pencil className="mr-2 h-4 w-4" />
                 Edit
               </Button>
             )}
 
             {(mode === "edit" || mode === "view") && (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="icon">
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