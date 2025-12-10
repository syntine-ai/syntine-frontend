import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Camera } from "lucide-react";

export default function AdminProfile() {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Profile"
        subtitle="Manage your admin account settings"
      >
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your admin profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-admin-accent text-admin-accent-foreground text-xl">
                      AD
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
                  <h3 className="font-medium">Super Admin</h3>
                  <p className="text-sm text-muted-foreground">admin@syntine.io</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-admin-accent" />
                    <span className="text-xs text-admin-accent">Full Access</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" defaultValue="Super Admin" className="pl-10" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" defaultValue="admin@syntine.io" className="pl-10" />
                  </div>
                </div>
              </div>

              <Button className="bg-admin-accent hover:bg-admin-accent/90">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
}
