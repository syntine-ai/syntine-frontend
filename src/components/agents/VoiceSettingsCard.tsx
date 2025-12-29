import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Volume2, Gauge, Music } from "lucide-react";

interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  enableSSML: boolean;
}

interface VoiceSettingsCardProps {
  value: VoiceSettings;
  onChange: (value: VoiceSettings) => void;
}

const voiceOptions = [
  { id: "en-US-Neural2-A", name: "Emma (Female)", accent: "US" },
  { id: "en-US-Neural2-D", name: "James (Male)", accent: "US" },
  { id: "en-GB-Neural2-A", name: "Sophie (Female)", accent: "UK" },
  { id: "en-GB-Neural2-B", name: "Oliver (Male)", accent: "UK" },
  { id: "en-AU-Neural2-A", name: "Olivia (Female)", accent: "AU" },
  { id: "en-AU-Neural2-B", name: "Jack (Male)", accent: "AU" },
];

export function VoiceSettingsCard({ value, onChange }: VoiceSettingsCardProps) {
  const updateSetting = <K extends keyof VoiceSettings>(key: K, val: VoiceSettings[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Voice Settings</CardTitle>
        <CardDescription>
          Configure the agent's voice characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            Voice
          </Label>
          <Select value={value.voice} onValueChange={(v) => updateSetting("voice", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.accent})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              Speed
            </Label>
            <span className="text-sm text-muted-foreground">{value.speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[value.speed]}
            onValueChange={([v]) => updateSetting("speed", v)}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              Pitch
            </Label>
            <span className="text-sm text-muted-foreground">{value.pitch > 0 ? "+" : ""}{value.pitch.toFixed(0)} st</span>
          </div>
          <Slider
            value={[value.pitch]}
            onValueChange={([v]) => updateSetting("pitch", v)}
            min={-10}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lower</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              Volume
            </Label>
            <span className="text-sm text-muted-foreground">{Math.round(value.volume * 100)}%</span>
          </div>
          <Slider
            value={[value.volume]}
            onValueChange={([v]) => updateSetting("volume", v)}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        {/* SSML Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="font-medium text-foreground">Enable SSML</p>
            <p className="text-sm text-muted-foreground">
              Allow advanced speech markup for natural pauses
            </p>
          </div>
          <Switch
            checked={value.enableSSML}
            onCheckedChange={(v) => updateSetting("enableSSML", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
