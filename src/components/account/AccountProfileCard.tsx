import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, User, Mail, Building2, Globe, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountProfileCardProps {
  variant: "org" | "admin";
}

const timezones = [
  { value: "IST", label: "IST (India Standard Time)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "PST", label: "PST (Pacific Standard Time)" },
  { value: "EST", label: "EST (Eastern Standard Time)" },
];

export function AccountProfileCard({ variant }: AccountProfileCardProps) {
  const { toast } = useToast();
  const isAdmin = variant === "admin";
  
  const [name, setName] = useState(isAdmin ? "Super Admin" : "John Doe");
  const [timezone, setTimezone] = useState("UTC");

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile changes have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Profile
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? "Your administrator identity and preferences"
            : "Your personal information and preferences"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback
                className={
                  isAdmin
                    ? "bg-admin-accent text-admin-accent-foreground text-xl"
                    : "bg-primary text-primary-foreground text-xl"
                }
              >
                {isAdmin ? "AD" : "JD"}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "admin@syntine.io" : "john@acmecorp.com"}
            </p>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-admin-accent" />
                <span className="text-xs text-admin-accent">Full Access</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={isAdmin ? "admin@syntine.io" : "john@acmecorp.com"}
                className="pl-10 bg-muted"
                disabled
              />
            </div>
          </div>

          {isAdmin ? (
            <div className="grid gap-2">
              <Label htmlFor="role">Admin Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  value="Super Administrator"
                  className="pl-10 bg-muted"
                  disabled
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organization"
                  value="Acme Corp"
                  className="pl-10 bg-muted"
                  disabled
                />
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          className={isAdmin ? "bg-admin-accent hover:bg-admin-accent/90" : ""}
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
