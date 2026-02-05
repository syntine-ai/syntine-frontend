 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Textarea } from "@/components/ui/textarea";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { MessageSquare, FileText, Clock, Link2, Copy } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { toast } from "sonner";
 import { format } from "date-fns";
 
 interface AgentConfigPanelProps {
   systemPrompt: string;
   onSystemPromptChange: (value: string) => void;
   firstMessage: string;
   onFirstMessageChange: (value: string) => void;
   isReadOnly?: boolean;
   agentId?: string;
   linkedCampaigns?: number;
   createdAt?: string;
   updatedAt?: string;
 }
 
 const PROMPT_SOFT_LIMIT = 4000;
 
 export function AgentConfigPanel({
   systemPrompt,
   onSystemPromptChange,
   firstMessage,
   onFirstMessageChange,
   isReadOnly = false,
   agentId,
   linkedCampaigns = 0,
   createdAt,
   updatedAt,
 }: AgentConfigPanelProps) {
   const handleCopyPrompt = () => {
     navigator.clipboard.writeText(systemPrompt);
     toast.success("Prompt copied to clipboard");
   };
 
   const promptLength = systemPrompt.length;
   const isNearLimit = promptLength > PROMPT_SOFT_LIMIT * 0.8;
   const isOverLimit = promptLength > PROMPT_SOFT_LIMIT;
 
   return (
     <div className="space-y-6">
       {/* System Prompt - Primary Section */}
       <Card>
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <MessageSquare className="h-4 w-4 text-primary" />
               <CardTitle className="text-base font-medium">Agent Instructions</CardTitle>
               <Badge variant="secondary" className="text-xs">Required</Badge>
             </div>
             {!isReadOnly && (
               <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="gap-1.5 h-8">
                 <Copy className="h-3.5 w-3.5" />
                 Copy
               </Button>
             )}
           </div>
           <CardDescription>
             Define how the agent should behave during calls. This is the core brain of the agent.
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-3">
           <Textarea
             value={systemPrompt}
             onChange={(e) => onSystemPromptChange(e.target.value)}
             placeholder={`You are a helpful AI assistant for customer calls.
 
 Guidelines:
 - Introduce yourself clearly at the start
 - Listen carefully to customer needs
 - Provide concise, accurate information
 - Confirm key details before ending
 
 Variables available:
 {{customer_name}} - Customer's name
 {{order_id}} - Related order ID
 {{product_name}} - Product being discussed`}
             className="min-h-[280px] font-mono text-sm resize-y"
             disabled={isReadOnly}
           />
           <div className="flex items-center justify-between text-xs">
             <span className="text-muted-foreground">
               Supports variables: <code className="bg-muted px-1 py-0.5 rounded">{"{{customer_name}}"}</code>,{" "}
               <code className="bg-muted px-1 py-0.5 rounded">{"{{order_id}}"}</code>
             </span>
             <span className={isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground"}>
               {promptLength.toLocaleString()} / {PROMPT_SOFT_LIMIT.toLocaleString()} chars
             </span>
           </div>
         </CardContent>
       </Card>
 
       {/* First Message - Optional Section */}
       <Card>
         <CardHeader className="pb-3">
           <div className="flex items-center gap-2">
             <FileText className="h-4 w-4 text-primary" />
             <CardTitle className="text-base font-medium">First Message</CardTitle>
             <Badge variant="outline" className="text-xs">Optional</Badge>
           </div>
           <CardDescription>
             What the agent says when the call connects. Leave empty to wait for caller to speak first.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Textarea
             value={firstMessage}
             onChange={(e) => onFirstMessageChange(e.target.value)}
             placeholder="Hello! I'm calling regarding your recent order. Is this a good time to talk?"
             className="min-h-[100px] resize-y"
             disabled={isReadOnly}
           />
           <p className="text-xs text-muted-foreground mt-2">
             {firstMessage.length} characters
           </p>
         </CardContent>
       </Card>
 
       {/* Metadata Section - Read-only info */}
       {agentId && (
         <Card className="bg-muted/30">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Metadata</CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-muted-foreground text-xs mb-1">Agent ID</p>
                 <code className="text-xs bg-muted px-2 py-1 rounded font-mono block truncate">
                   {agentId}
                 </code>
               </div>
               <div>
                 <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                   <Link2 className="h-3 w-3" />
                   Linked Campaigns
                 </p>
                 <p className="font-medium">{linkedCampaigns}</p>
               </div>
               {createdAt && (
                 <div>
                   <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                     <Clock className="h-3 w-3" />
                     Created
                   </p>
                   <p className="text-xs">{format(new Date(createdAt), "MMM d, yyyy")}</p>
                 </div>
               )}
               {updatedAt && (
                 <div>
                   <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                     <Clock className="h-3 w-3" />
                     Last Updated
                   </p>
                   <p className="text-xs">{format(new Date(updatedAt), "MMM d, yyyy h:mm a")}</p>
                 </div>
               )}
             </div>
           </CardContent>
         </Card>
       )}
     </div>
   );
 }