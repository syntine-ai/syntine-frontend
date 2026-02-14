import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Send, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface InternalNotesPanelProps {
  notes: Note[];
  collapsed: boolean;
  onToggle: () => void;
}

export function InternalNotesPanel({ notes, collapsed, onToggle }: InternalNotesPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);

  const handleAdd = () => {
    if (!newNote.trim()) return;
    setLocalNotes((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, author: "You", content: newNote.trim(), created_at: new Date().toISOString() },
    ]);
    setNewNote("");
  };

  return (
    <div className="relative flex">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-4 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-border rounded-lg bg-card overflow-hidden flex flex-col"
          >
            <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-[hsl(var(--warning))]" />
              <span className="text-xs font-semibold text-foreground">Internal Notes</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{localNotes.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[400px]">
              {localNotes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No internal notes yet</p>
              )}
              {localNotes.map((note) => (
                <div key={note.id} className="bg-[hsl(var(--warning))]/8 border border-[hsl(var(--warning))]/20 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-foreground">{note.author}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(note.created_at), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-border">
              <div className="flex gap-1.5">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className={cn("min-h-[60px] text-xs resize-none flex-1")}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
                />
              </div>
              <Button size="sm" className="w-full mt-1.5 h-7 text-xs gap-1" onClick={handleAdd} disabled={!newNote.trim()}>
                <Send className="h-3 w-3" /> Add Note
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
