import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX,
  MicOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CallRecordingPlayerProps {
  recordingUrl?: string;
  duration?: string;
}

export function CallRecordingPlayer({ 
  recordingUrl, 
  duration = "2:34" 
}: CallRecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (percent: number) => {
    // Mock time calculation based on duration string
    const [mins, secs] = duration.split(":").map(Number);
    const totalSeconds = mins * 60 + secs;
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const currentMins = Math.floor(currentSeconds / 60);
    const currentSecs = currentSeconds % 60;
    return `${currentMins}:${currentSecs.toString().padStart(2, "0")}`;
  };

  if (!recordingUrl) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Recording</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MicOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recording available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Recordings are only available for answered calls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="text-sm font-medium text-foreground mb-4">Recording</h3>
      
      <div className="space-y-4">
        {/* Waveform Visualization (Mock) */}
        <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary/20"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-4">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-colors",
                  i < (progress / 100) * 50 ? "bg-primary" : "bg-muted-foreground/30"
                )}
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 20}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={([value]) => setProgress(value)}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={([value]) => {
                  setVolume(value);
                  setIsMuted(value === 0);
                }}
                max={100}
                className="w-20"
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
