import { useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function KnowledgeBase() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragOver, setIsDragOver] = useState(false);

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

    setUploadState("success");
    toast.success("PDF uploaded successfully");

    // Reset after success
    setTimeout(() => {
      setFile(null);
      setUploadState("idle");
    }, 2000);
  };

  return (
    <PageContainer
      title="Knowledge Base"
      subtitle="Upload PDFs to provide reference material for the system."
    >
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
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
      </div>
    </PageContainer>
  );
}
