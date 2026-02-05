 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Switch } from "@/components/ui/switch";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Zap, RefreshCw, Clock } from "lucide-react";
 import { CampaignWithDetails } from "@/hooks/useCampaigns";
 
 interface AutoTriggerSettingsCardProps {
   campaign?: CampaignWithDetails;
   onUpdate: (data: {
     auto_trigger_enabled?: boolean;
     max_retry_attempts?: number;
     retry_delay_minutes?: number;
   }) => Promise<void>;
 }
 
 export function AutoTriggerSettingsCard({ campaign, onUpdate }: AutoTriggerSettingsCardProps) {
   const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(campaign?.auto_trigger_enabled || false);
   const [maxRetryAttempts, setMaxRetryAttempts] = useState(campaign?.max_retry_attempts || 3);
   const [retryDelayMinutes, setRetryDelayMinutes] = useState(campaign?.retry_delay_minutes || 60);
   const [isUpdating, setIsUpdating] = useState(false);
 
   // Sync local state when campaign changes
   useEffect(() => {
     if (campaign) {
       setAutoTriggerEnabled(campaign.auto_trigger_enabled || false);
       setMaxRetryAttempts(campaign.max_retry_attempts || 3);
       setRetryDelayMinutes(campaign.retry_delay_minutes || 60);
     }
   }, [campaign]);
 
   const handleAutoTriggerToggle = async (enabled: boolean) => {
     setAutoTriggerEnabled(enabled);
     setIsUpdating(true);
     try {
       await onUpdate({ auto_trigger_enabled: enabled });
     } finally {
       setIsUpdating(false);
     }
   };
 
   const handleRetrySettingsBlur = async () => {
     setIsUpdating(true);
     try {
       await onUpdate({
         max_retry_attempts: maxRetryAttempts,
         retry_delay_minutes: retryDelayMinutes,
       });
     } finally {
       setIsUpdating(false);
     }
   };
 
   const campaignType = (campaign as any)?.campaign_type || "outbound";
   const isAutoTriggerType = campaignType === "order_conversion" || campaignType === "cart_recovery";
 
   if (!isAutoTriggerType) {
     return null;
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.2 }}
     >
       <Card className="border-border/50">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div className="space-y-1">
               <div className="flex items-center gap-2">
                 <CardTitle className="text-lg">Auto-Trigger Settings</CardTitle>
                 <Badge variant="outline" className="capitalize">
                   {campaignType.replace("_", " ")}
                 </Badge>
               </div>
               <CardDescription>
                 Automatically queue calls when new orders or carts are detected
               </CardDescription>
             </div>
             <Switch
               checked={autoTriggerEnabled}
               onCheckedChange={handleAutoTriggerToggle}
               disabled={isUpdating}
             />
           </div>
         </CardHeader>
 
         {autoTriggerEnabled && (
           <CardContent className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Max Retry Attempts */}
               <div className="space-y-2">
                 <Label htmlFor="max_retry" className="flex items-center gap-2">
                   <RefreshCw className="h-4 w-4 text-muted-foreground" />
                   Max Retry Attempts
                 </Label>
                 <Input
                   id="max_retry"
                   type="number"
                   min={0}
                   max={10}
                   value={maxRetryAttempts}
                   onChange={(e) => setMaxRetryAttempts(parseInt(e.target.value) || 0)}
                   onBlur={handleRetrySettingsBlur}
                   className="w-full"
                 />
                 <p className="text-xs text-muted-foreground">
                   Number of times to retry failed calls
                 </p>
               </div>
 
               {/* Retry Delay */}
               <div className="space-y-2">
                 <Label htmlFor="retry_delay" className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   Retry Delay (minutes)
                 </Label>
                 <Input
                   id="retry_delay"
                   type="number"
                   min={5}
                   max={1440}
                   value={retryDelayMinutes}
                   onChange={(e) => setRetryDelayMinutes(parseInt(e.target.value) || 60)}
                   onBlur={handleRetrySettingsBlur}
                   className="w-full"
                 />
                 <p className="text-xs text-muted-foreground">
                   Wait time between retry attempts
                 </p>
               </div>
             </div>
 
             {/* Info Banner */}
             <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
               <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <p className="text-sm font-medium text-foreground">
                   How Auto-Trigger Works
                 </p>
                 <p className="text-xs text-muted-foreground">
                   {campaignType === "order_conversion"
                     ? "When new orders with phone numbers are synced, they're automatically added to the call queue for this campaign."
                     : "When carts are marked as abandoned with valid phone numbers, they're automatically added to the call queue for recovery."}
                 </p>
               </div>
             </div>
           </CardContent>
         )}
       </Card>
     </motion.div>
   );
 }