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
  duration: initialDuration = "0:00"
}: CallRecordingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize duration from props (convert string "MM:SS" to seconds if needed) or default
  // But reliable totalDuration comes from onLoadedMetadata

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleError = () => {
    setIsPlaying(false);
    console.error("Audio playback error");
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * totalDuration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
    if (newVol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const formatTimeSeconds = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={recordingUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
      />

      <div className="space-y-4">
        {/* Simple Visualizer / Progress Bar */}
        <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center gap-1 px-4 opacity-50">
            {/* Fake waveform bars just for visuals */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-colors",
                  i < (progress / 100) * 40 ? "bg-primary" : "bg-muted-foreground/30"
                )}
                style={{
                  height: `${10 + Math.random() * 20}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTimeSeconds(currentTime)}</span>
            <span>{formatTimeSeconds(totalDuration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={togglePlay}
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
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.05}
                className="w-20"
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"
            onClick={() => window.open(recordingUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
