import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const contacts = [
  { id: 1, name: "Sarah Johnson", email: "sarah@acme.com", phone: "+1 555-0123", company: "Acme Inc", tags: ["VIP", "Enterprise"] },
  { id: 2, name: "Michael Chen", email: "m.chen@techcorp.io", phone: "+1 555-0124", company: "TechCorp", tags: ["Lead"] },
  { id: 3, name: "Emily Davis", email: "emily.d@startup.co", phone: "+1 555-0125", company: "StartupCo", tags: ["SMB"] },
  { id: 4, name: "James Wilson", email: "jwilson@enterprise.com", phone: "+1 555-0126", company: "Enterprise Ltd", tags: ["Enterprise", "Active"] },
  { id: 5, name: "Lisa Anderson", email: "l.anderson@global.io", phone: "+1 555-0127", company: "Global Inc", tags: ["VIP"] },
];

const Contacts = () => {
  return (
    <OrgAppShell>
      <PageContainer
        title="Contacts"
        subtitle="Manage your contact database"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      >
        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9" />
        </div>

        {/* Contacts Table */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tags</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, i) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {contact.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{contact.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{contact.company}</td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Contacts;
