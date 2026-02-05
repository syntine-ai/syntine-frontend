 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { AgentTopBar } from "@/components/agents/AgentTopBar";
 import { AgentConfigPanel } from "@/components/agents/AgentConfigPanel";
 import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
 import { useAgents } from "@/hooks/useAgents";
 import { toast } from "sonner";
 
 const AgentCreate = () => {
   const navigate = useNavigate();
   const { createAgent } = useAgents();
   const [isSaving, setIsSaving] = useState(false);
 
   // Form state
   const [name, setName] = useState("");
   const [systemPrompt, setSystemPrompt] = useState("");
   const [firstMessage, setFirstMessage] = useState("");
 
   const handleCreate = async () => {
     if (!name.trim()) {
       toast.error("Please enter an agent name");
       return;
     }
 
     if (!systemPrompt.trim()) {
       toast.error("Please enter agent instructions");
       return;
     }
 
     try {
       setIsSaving(true);
 
       // Create agent with combined prompt (system prompt + first message stored in system_prompt)
       const combinedPrompt = firstMessage
         ? `${systemPrompt}\n\n---\nFIRST MESSAGE:\n${firstMessage}`
         : systemPrompt;
 
       const newAgent = await createAgent({
         name: name.trim(),
         language: "English",
         tone: "professional",
         system_prompt: combinedPrompt,
       });
 
       if (newAgent) {
         toast.success("Agent created successfully");
         navigate(`/agents/${newAgent.id}`);
       }
     } catch (error) {
       console.error("Failed to create agent:", error);
       toast.error("Failed to create agent");
     } finally {
       setIsSaving(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-background">
       <AgentTopBar
         mode="create"
         name={name}
         onNameChange={setName}
         status="draft"
         isSaving={isSaving}
         onSave={handleCreate}
       />
 
       {/* Two-Panel Layout */}
       <div className="flex flex-col lg:flex-row">
         {/* Left Panel - Configuration */}
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex-1 p-6 lg:border-r border-border overflow-auto"
         >
           <div className="max-w-2xl">
             <h2 className="text-lg font-semibold text-foreground mb-4">
               Agent Configuration
             </h2>
             <AgentConfigPanel
               systemPrompt={systemPrompt}
               onSystemPromptChange={setSystemPrompt}
               firstMessage={firstMessage}
               onFirstMessageChange={setFirstMessage}
               isReadOnly={false}
             />
           </div>
         </motion.div>
 
         {/* Right Panel - Testing */}
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="w-full lg:w-[400px] p-6 bg-muted/20"
         >
           <h2 className="text-lg font-semibold text-foreground mb-4">
             Agent Testing
           </h2>
           <AgentTestPanel
             agentName={name || "New Agent"}
             hasPhoneNumber={false}
             isDisabled={true}
           />
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default AgentCreate;