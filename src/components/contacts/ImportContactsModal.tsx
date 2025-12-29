import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Check, X, AlertCircle, User, Phone, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ContactListWithCount } from "@/hooks/useContacts";

interface ImportContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactLists?: ContactListWithCount[];
  onImport?: (
    contacts: Array<{ firstName: string; lastName: string; phone: string; email?: string }>,
    listId: string
  ) => Promise<void>;
}

interface ParsedContact {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export function ImportContactsModal({ 
  open, 
  onOpenChange, 
  contactLists = [],
  onImport,
}: ImportContactsModalProps) {
  const [step, setStep] = useState(1);
  const [targetList, setTargetList] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const resetModal = () => {
    setStep(1);
    setTargetList("");
    setFile(null);
    setParsedContacts([]);
    setIsImporting(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetModal, 200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSV = (text: string): ParsedContact[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIndex = headers.findIndex((h) => h.includes("name"));
    const firstNameIndex = headers.findIndex((h) => h.includes("first"));
    const lastNameIndex = headers.findIndex((h) => h.includes("last"));
    const phoneIndex = headers.findIndex((h) => h.includes("phone"));
    const emailIndex = headers.findIndex((h) => h.includes("email"));

    const contacts: ParsedContact[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      
      let firstName = "";
      let lastName = "";
      
      if (firstNameIndex >= 0 && lastNameIndex >= 0) {
        firstName = values[firstNameIndex] || "";
        lastName = values[lastNameIndex] || "";
      } else if (nameIndex >= 0) {
        const nameParts = (values[nameIndex] || "").split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }

      const phone = phoneIndex >= 0 ? values[phoneIndex] : "";
      const email = emailIndex >= 0 ? values[emailIndex] : undefined;

      if (firstName && phone) {
        contacts.push({ firstName, lastName, phone, email });
      }
    }

    return contacts;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx")) {
        setFile(droppedFile);
        // Parse CSV
        if (droppedFile.name.endsWith(".csv")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = parseCSV(text);
            setParsedContacts(parsed);
          };
          reader.readAsText(droppedFile);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Parse CSV
      if (selectedFile.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const parsed = parseCSV(text);
          setParsedContacts(parsed);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!targetList || parsedContacts.length === 0 || !onImport) return;
    
    setIsImporting(true);
    try {
      await onImport(parsedContacts, targetList);
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const selectedListName = contactLists.find((l) => l.id === targetList)?.name;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Import Contacts</DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-colors",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-1" />
        </div>

        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Select List */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Select Contact List
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which list to import contacts into
                  </p>
                </div>

                <Select value={targetList} onValueChange={setTargetList}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose a contact list" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {contactLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!targetList}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload File */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Upload File
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supported fields: Name (or First Name, Last Name), Phone, Email (optional)
                  </p>
                </div>

                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-success bg-success/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-success" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {parsedContacts.length} contacts found
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setFile(null);
                          setParsedContacts([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-foreground mb-1">
                        Drag and drop your file here
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>Browse Files</span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-3">
                        Accepts .csv files
                      </p>
                    </>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!file || parsedContacts.length === 0}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preview & Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Preview & Confirm
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review contacts before importing to{" "}
                    <span className="text-foreground font-medium">
                      {selectedListName}
                    </span>
                  </p>
                </div>

                <div className="bg-background rounded-lg border border-border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-6 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Name
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Phone
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {parsedContacts.slice(0, 10).map((contact, index) => (
                      <div
                        key={index}
                        className="px-4 py-2.5 border-b border-border last:border-0 flex items-center gap-4 text-sm"
                      >
                        <span className="text-foreground font-medium min-w-[140px]">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="text-muted-foreground min-w-[140px]">
                          {contact.phone}
                        </span>
                        <span className="text-muted-foreground">
                          {contact.email || "—"}
                        </span>
                      </div>
                    ))}
                    {parsedContacts.length > 10 && (
                      <div className="px-4 py-2.5 text-sm text-muted-foreground text-center">
                        ... and {parsedContacts.length - 10} more contacts
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {parsedContacts.length} contacts will be imported with "Not Called" status
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isImporting}>
                    Back
                  </Button>
                  <Button onClick={handleConfirmImport} disabled={isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      "Confirm Import"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
