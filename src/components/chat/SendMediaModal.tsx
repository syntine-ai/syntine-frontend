import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Image, Video, Upload, Send, X } from "lucide-react";

interface SendMediaModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (mediaType: "image" | "video", caption: string) => void;
}

export function SendMediaModal({ open, onClose, onSend }: SendMediaModalProps) {
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSend = () => {
    onSend(mediaType, caption);
    setCaption("");
    setFileName(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-[hsl(var(--success))]" />
            Send Media
          </DialogTitle>
          <DialogDescription>Upload an image or video to send.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media type selector */}
          <div className="flex gap-2">
            {(["image", "video"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  mediaType === type
                    ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "image" ? <Image className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Upload area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[hsl(var(--success))]/40 transition-colors cursor-pointer relative"
          >
            <input
              type="file"
              accept={mediaType === "image" ? "image/*" : "video/*"}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            {fileName ? (
              <div className="flex items-center justify-center gap-2">
                {mediaType === "image" ? <Image className="h-5 w-5 text-[hsl(var(--success))]" /> : <Video className="h-5 w-5 text-[hsl(var(--success))]" />}
                <span className="text-sm text-foreground">{fileName}</span>
                <button onClick={(e) => { e.stopPropagation(); setFileName(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">{mediaType === "image" ? "JPG, PNG, WebP" : "MP4, MOV"}</p>
              </>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <Label>Caption (optional)</Label>
            <Input
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!fileName} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Send {mediaType === "image" ? "Image" : "Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
