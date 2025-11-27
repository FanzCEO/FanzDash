import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, FileText, Upload, X, AlertCircle } from "lucide-react";

interface DocumentUploaderProps {
  endpoint: string; // API endpoint for upload (e.g., "/api/crm/leads/123/upload")
  entityType?: string; // e.g., "lead", "client", "project", "employee"
  entityId?: string;
  onUploadComplete?: (response: any) => void;
  onUploadError?: (error: Error) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  showDocumentType?: boolean;
  showTags?: boolean;
  showDescription?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonText?: string;
  buttonIcon?: ReactNode;
}

interface UploadedFile {
  file: File;
  documentType?: string;
  tags?: string;
  description?: string;
}

/**
 * Universal Document Uploader Component
 *
 * Supports uploading various document types to any endpoint:
 * - CSV (data imports/exports)
 * - PDF (contracts, reports, proposals)
 * - DOCX/DOC (business documents)
 * - XLSX/XLS (spreadsheets, budgets)
 * - TXT (notes, logs)
 * - JSON (data exports)
 *
 * Features:
 * - File type validation
 * - Size validation
 * - Progress tracking
 * - Metadata (type, tags, description)
 * - Error handling
 * - Success confirmation
 *
 * Usage:
 * ```tsx
 * <DocumentUploader
 *   endpoint="/api/crm/leads/lead123/upload"
 *   entityType="lead"
 *   entityId="lead123"
 *   showDocumentType
 *   showTags
 *   showDescription
 *   onUploadComplete={(response) => console.log('Upload complete!', response)}
 * />
 * ```
 */
export function DocumentUploader({
  endpoint,
  entityType = "document",
  entityId,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = [
    '.csv',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.json'
  ],
  maxFileSizeMB = 50,
  showDocumentType = false,
  showTags = false,
  showDescription = true,
  buttonVariant = "default",
  buttonText = "Upload Document",
  buttonIcon = <Upload className="w-4 h-4 mr-2" />
}: DocumentUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Document type options
  const documentTypeOptions = [
    { value: "contract", label: "Contract" },
    { value: "proposal", label: "Proposal" },
    { value: "report", label: "Report" },
    { value: "invoice", label: "Invoice" },
    { value: "receipt", label: "Receipt" },
    { value: "resume", label: "Resume/CV" },
    { value: "certificate", label: "Certificate" },
    { value: "budget", label: "Budget" },
    { value: "spreadsheet", label: "Spreadsheet" },
    { value: "presentation", label: "Presentation" },
    { value: "data-import", label: "Data Import" },
    { value: "data-export", label: "Data Export" },
    { value: "legal", label: "Legal Document" },
    { value: "compliance", label: "Compliance Document" },
    { value: "other", label: "Other" }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setUploadError(`File size exceeds maximum of ${maxFileSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      setUploadError(`File type ${fileExtension} is not allowed. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (documentType) {
        formData.append('documentType', documentType);
      }
      if (tags) {
        formData.append('tags', tags);
      }
      if (description) {
        formData.append('description', description);
      }
      if (entityType) {
        formData.append('entityType', entityType);
      }
      if (entityId) {
        formData.append('entityId', entityId);
      }

      // Simulate progress (since fetch doesn't support progress directly)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header, browser will set it with boundary
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadProgress(100);
      setUploadSuccess(true);

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Auto-close after success
      setTimeout(() => {
        resetForm();
        setShowModal(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setUploadError(errorMessage);

      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentType("");
    setTags("");
    setDescription("");
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      setShowModal(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          {buttonIcon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Success */}
          {uploadSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Document uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* File Selection */}
          <div>
            <Label htmlFor="file-input">Select File</Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept={acceptedFileTypes.join(',')}
              disabled={uploading || uploadSuccess}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Accepted: {acceptedFileTypes.join(', ')} | Max size: {maxFileSizeMB}MB
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!uploading && !uploadSuccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Document Type */}
          {showDocumentType && selectedFile && !uploadSuccess && (
            <div>
              <Label htmlFor="document-type">Document Type (Optional)</Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          {showTags && selectedFile && !uploadSuccess && (
            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., contract, Q4-2024, important"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple tags with commas
              </p>
            </div>
          )}

          {/* Description */}
          {showDescription && selectedFile && !uploadSuccess && (
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes or description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              {uploadSuccess ? 'Close' : 'Cancel'}
            </Button>
            {!uploadSuccess && (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
