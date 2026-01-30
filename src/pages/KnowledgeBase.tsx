import { useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
}

export default function KnowledgeBase() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setUploadState("idle");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState("uploading");

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add to uploaded documents list
    const newDoc: UploadedDocument = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
    };
    setUploadedDocs((prev) => [newDoc, ...prev]); // Add to beginning of list

    setUploadState("success");
    toast.success("PDF uploaded successfully");

    // Reset after success
    setTimeout(() => {
      setFile(null);
      setUploadState("idle");
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.id !== id));
    toast.success("Document deleted");
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <PageContainer
      title="Knowledge Base"
      subtitle="Upload PDFs to provide reference material for the system."
    >
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upload Card */}
        <Card className="w-full p-6">
          {/* Upload Area */}
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
              uploadState === "success" && "border-green-500 bg-green-500/5"
            )}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadState === "uploading"}
            />

            {uploadState === "success" ? (
              <div className="flex flex-col items-center gap-2 text-green-500">
                <CheckCircle className="h-10 w-10" />
                <p className="text-sm font-medium">PDF uploaded successfully</p>
              </div>
            ) : uploadState === "uploading" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {file ? (
                  <>
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Drag & drop PDF files here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to upload
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max 20MB per file
                    </p>
                  </>
                )}
              </div>
            )}
          </label>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploadState === "uploading" || uploadState === "success"}
            className="w-full mt-4"
          >
            {uploadState === "uploading" ? "Uploading..." : "Upload PDF"}
          </Button>
        </Card>

        {/* Uploaded Documents Section */}
        {uploadedDocs.length > 0 ? (
          <div className="w-full mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Uploaded Documents
            </h3>
            <div className="space-y-2">
              {uploadedDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          {formatSize(doc.size)}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-12 mt-8">
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
