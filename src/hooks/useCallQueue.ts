 import { useState, useEffect, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useToast } from "@/hooks/use-toast";
 import type { Database } from "@/integrations/supabase/types";
 
 type CallQueueItem = Database["public"]["Tables"]["call_queue"]["Row"];
 type CallQueueInsert = Database["public"]["Tables"]["call_queue"]["Insert"];
 type CallQueueUpdate = Database["public"]["Tables"]["call_queue"]["Update"];
 
 export type CallQueueStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
 
 export interface CallQueueItemWithDetails extends CallQueueItem {
   campaign?: { id: string; name: string } | null;
   order?: { id: string; order_number: string | null; customer_name: string | null } | null;
   cart?: { id: string; customer_name: string | null; total_value: number | null } | null;
 }
 
 interface UseCallQueueOptions {
   campaignId?: string;
   status?: CallQueueStatus | CallQueueStatus[];
   limit?: number;
 }
 
 export function useCallQueue(options: UseCallQueueOptions = {}) {
   const { profile } = useAuth();
   const { toast } = useToast();
   const [items, setItems] = useState<CallQueueItemWithDetails[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   const fetchQueueItems = useCallback(async () => {
     if (!profile?.organization_id) return;
 
     try {
       setIsLoading(true);
       setError(null);
 
       let query = supabase
         .from("call_queue")
         .select(`
           *,
           campaign:campaigns(id, name),
           order:commerce_orders(id, order_number, customer_name),
           cart:commerce_abandoned_carts(id, customer_name, total_value)
         `)
         .eq("organization_id", profile.organization_id)
         .order("scheduled_at", { ascending: true });
 
       if (options.campaignId) {
         query = query.eq("campaign_id", options.campaignId);
       }
 
       if (options.status) {
         if (Array.isArray(options.status)) {
           query = query.in("status", options.status);
         } else {
           query = query.eq("status", options.status);
         }
       }
 
       if (options.limit) {
         query = query.limit(options.limit);
       }
 
       const { data, error: fetchError } = await query;
 
       if (fetchError) throw fetchError;
 
        // Transform the nested relations
        const transformedItems: CallQueueItemWithDetails[] = (data || []).map((item) => ({
          ...item,
          campaign: item.campaign as { id: string; name: string } | null,
          order: item.order as unknown as { id: string; order_number: string | null; customer_name: string | null } | null,
          cart: item.cart as { id: string; customer_name: string | null; total_value: number | null } | null,
        }));
 
       setItems(transformedItems);
     } catch (err) {
       console.error("Error fetching call queue:", err);
       setError("Failed to fetch call queue");
     } finally {
       setIsLoading(false);
     }
   }, [profile?.organization_id, options.campaignId, options.status, options.limit]);
 
   useEffect(() => {
     fetchQueueItems();
   }, [fetchQueueItems]);
 
   const enqueueCall = async (data: {
     campaignId: string;
     phoneNumber: string;
     orderId?: string;
     cartId?: string;
     customerId?: string;
     scheduledAt?: string;
   }) => {
     if (!profile?.organization_id) {
       toast({
         title: "Error",
         description: "You must be logged in to enqueue calls",
         variant: "destructive",
       });
       return null;
     }
 
     try {
       const insertData: CallQueueInsert = {
         organization_id: profile.organization_id,
         campaign_id: data.campaignId,
         phone_number: data.phoneNumber,
         order_id: data.orderId || null,
         cart_id: data.cartId || null,
         customer_id: data.customerId || null,
         scheduled_at: data.scheduledAt || new Date().toISOString(),
         status: "pending",
       };
 
       const { data: newItem, error } = await supabase
         .from("call_queue")
         .insert(insertData)
         .select()
         .single();
 
       if (error) {
         if (error.message.includes("duplicate") || error.code === "23505") {
           toast({
             title: "Already Queued",
             description: "This item is already in the call queue for this campaign.",
           });
           return null;
         }
         throw error;
       }
 
       await fetchQueueItems();
 
       toast({
         title: "Call Queued",
         description: "The call has been added to the queue.",
       });
 
       return newItem;
     } catch (err) {
       console.error("Error enqueuing call:", err);
       toast({
         title: "Error",
         description: "Failed to enqueue call",
         variant: "destructive",
       });
       return null;
     }
   };
 
   const updateQueueItem = async (id: string, data: Partial<CallQueueUpdate>) => {
     try {
       const { data: updatedItem, error } = await supabase
         .from("call_queue")
         .update({ ...data, updated_at: new Date().toISOString() })
         .eq("id", id)
         .select()
         .single();
 
       if (error) throw error;
 
       setItems((prev) =>
         prev.map((item) =>
           item.id === id ? { ...item, ...updatedItem } : item
         )
       );
 
       return updatedItem;
     } catch (err) {
       console.error("Error updating queue item:", err);
       toast({
         title: "Error",
         description: "Failed to update queue item",
         variant: "destructive",
       });
       return null;
     }
   };
 
   const cancelQueueItem = async (id: string) => {
     const result = await updateQueueItem(id, { status: "cancelled" });
     if (result) {
       toast({
         title: "Call Cancelled",
         description: "The queued call has been cancelled.",
       });
     }
     return result;
   };
 
   const retryQueueItem = async (id: string) => {
     const item = items.find((i) => i.id === id);
     if (!item) return null;
 
     const result = await updateQueueItem(id, {
       status: "pending",
       retry_count: (item.retry_count || 0) + 1,
       scheduled_at: new Date().toISOString(),
       error_message: null,
     });
 
     if (result) {
       toast({
         title: "Call Requeued",
         description: "The call has been added back to the queue.",
       });
     }
     return result;
   };
 
   const deleteQueueItem = async (id: string) => {
     try {
       const { error } = await supabase
         .from("call_queue")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
 
       setItems((prev) => prev.filter((item) => item.id !== id));
 
       toast({
         title: "Item Removed",
         description: "The queue item has been removed.",
       });
 
       return true;
     } catch (err) {
       console.error("Error deleting queue item:", err);
       toast({
         title: "Error",
         description: "Failed to delete queue item",
         variant: "destructive",
       });
       return false;
     }
   };
 
   const getQueueStats = useCallback(async (campaignId?: string) => {
     if (!profile?.organization_id) return null;
 
     try {
       let query = supabase
         .from("call_queue")
         .select("status")
         .eq("organization_id", profile.organization_id);
 
       if (campaignId) {
         query = query.eq("campaign_id", campaignId);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
 
       const stats = {
         pending: 0,
         processing: 0,
         completed: 0,
         failed: 0,
         cancelled: 0,
         total: data?.length || 0,
       };
 
       data?.forEach((item) => {
         const status = item.status as CallQueueStatus;
         if (status in stats) {
           stats[status]++;
         }
       });
 
       return stats;
     } catch (err) {
       console.error("Error getting queue stats:", err);
       return null;
     }
   }, [profile?.organization_id]);
 
   return {
     items,
     isLoading,
     error,
     enqueueCall,
     updateQueueItem,
     cancelQueueItem,
     retryQueueItem,
     deleteQueueItem,
     getQueueStats,
     refetch: fetchQueueItems,
   };
 }