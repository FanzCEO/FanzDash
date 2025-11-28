import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Folder,
  Upload,
  Download,
  Share2,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Edit,
  Copy,
  Move,
  Star,
  Clock,
  Users,
  Shield,
  Key,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Search,
  Filter,
  MoreVertical,
  FolderPlus,
  FileUp,
  Archive,
  Image,
  Video,
  Music,
  FileCode,
  Database,
  Package,
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "document" | "image" | "video" | "audio" | "archive" | "code" | "spreadsheet" | "presentation" | "pdf" | "other";
  size: number;
  path: string;
  folderId?: string;
  isEncrypted: boolean;
  encryptionMethod?: "AES-256" | "RSA-2048" | "AES-128";
  tags: string[];
  owner: string;
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
  accessedDate: string;
  version: number;
  versionHistory: FileVersion[];
  permissions: FilePermission[];
  isShared: boolean;
  shareLinks: ShareLink[];
  isFavorite: boolean;
  isDeleted: boolean;
  deletedDate?: string;
  checksum?: string;
  mimeType?: string;
  thumbnail?: string;
  downloadCount: number;
  viewCount: number;
}

interface FileVersion {
  id: string;
  version: number;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  changes: string;
  checksum: string;
  isCurrent: boolean;
}

interface FilePermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "owner" | "editor" | "viewer" | "commenter";
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
  grantedBy: string;
  grantedDate: string;
  expiresDate?: string;
}

interface ShareLink {
  id: string;
  url: string;
  accessType: "view" | "edit" | "download";
  requiresPassword: boolean;
  password?: string;
  expiresDate?: string;
  maxDownloads?: number;
  downloadCount: number;
  createdBy: string;
  createdDate: string;
  isActive: boolean;
}

interface StorageQuota {
  userId: string;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  fileCount: number;
  folderCount: number;
  quotaWarning: boolean;
  quotaExceeded: boolean;
  lastUpdated: string;
}

interface FileActivity {
  id: string;
  fileId: string;
  fileName: string;
  action: "upload" | "download" | "view" | "edit" | "delete" | "share" | "rename" | "move" | "copy";
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  device?: string;
}

// API request helper
async function apiRequest(url: string, method: string = "GET", data?: any) {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

export default function DocumentManagementSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Dialogs
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEncrypt, setShowEncrypt] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState<FileItem | null>(null);

  // Form states
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [encryptionMethod, setEncryptionMethod] = useState<"AES-256" | "RSA-2048" | "AES-128">("AES-256");
  const [encryptionPassword, setEncryptionPassword] = useState("");

  // Queries
  const { data: files = [] } = useQuery<FileItem[]>({
    queryKey: ["/api/documents/files", currentFolder],
    refetchInterval: 30000,
  });

  const { data: storageQuota } = useQuery<StorageQuota>({
    queryKey: ["/api/documents/storage-quota"],
    refetchInterval: 60000,
  });

  const { data: recentActivity = [] } = useQuery<FileActivity[]>({
    queryKey: ["/api/documents/activity"],
    refetchInterval: 30000,
  });

  const { data: sharedFiles = [] } = useQuery<FileItem[]>({
    queryKey: ["/api/documents/shared"],
    refetchInterval: 30000,
  });

  const { data: favorites = [] } = useQuery<FileItem[]>({
    queryKey: ["/api/documents/favorites"],
    refetchInterval: 30000,
  });

  const { data: deletedFiles = [] } = useQuery<FileItem[]>({
    queryKey: ["/api/documents/trash"],
    refetchInterval: 60000,
  });

  // Mutations
  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/storage-quota"] });
      toast({ title: "Files uploaded successfully" });
      setShowUpload(false);
      setUploadFiles([]);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (data: { name: string; description: string; parentId?: string }) =>
      apiRequest("/api/documents/folders", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      toast({ title: "Folder created successfully" });
      setShowCreateFolder(false);
      setNewFolderName("");
      setNewFolderDescription("");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileIds: string[]) =>
      apiRequest("/api/documents/delete", "POST", { fileIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/trash"] });
      toast({ title: "Files moved to trash" });
      setSelectedFiles([]);
    },
  });

  const restoreFileMutation = useMutation({
    mutationFn: (fileIds: string[]) =>
      apiRequest("/api/documents/restore", "POST", { fileIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/trash"] });
      toast({ title: "Files restored successfully" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (fileIds: string[]) =>
      apiRequest("/api/documents/permanent-delete", "POST", { fileIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/trash"] });
      toast({ title: "Files permanently deleted" });
    },
  });

  const encryptFileMutation = useMutation({
    mutationFn: (data: { fileId: string; method: string; password: string }) =>
      apiRequest("/api/documents/encrypt", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      toast({ title: "File encrypted successfully" });
      setShowEncrypt(false);
      setEncryptionPassword("");
    },
  });

  const addPermissionMutation = useMutation({
    mutationFn: (data: Partial<FilePermission> & { fileId: string }) =>
      apiRequest("/api/documents/permissions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      toast({ title: "Permission added successfully" });
    },
  });

  const createShareLinkMutation = useMutation({
    mutationFn: (data: Partial<ShareLink> & { fileId: string }) =>
      apiRequest("/api/documents/share-links", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      toast({ title: "Share link created successfully" });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiRequest(`/api/documents/favorites/${fileId}`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/favorites"] });
      toast({ title: "Favorite updated" });
    },
  });

  // Helper functions
  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return <Folder className="w-5 h-5 text-yellow-400" />;
    switch (file.fileType) {
      case "image":
        return <Image className="w-5 h-5 text-purple-400" />;
      case "video":
        return <Video className="w-5 h-5 text-red-400" />;
      case "audio":
        return <Music className="w-5 h-5 text-green-400" />;
      case "archive":
        return <Archive className="w-5 h-5 text-orange-400" />;
      case "code":
        return <FileCode className="w-5 h-5 text-blue-400" />;
      case "spreadsheet":
        return <Database className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStoragePercentage = (): number => {
    if (!storageQuota) return 0;
    return (storageQuota.usedSpace / storageQuota.totalSpace) * 100;
  };

  const getStorageColor = (): string => {
    const percentage = getStoragePercentage();
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 75) return "text-yellow-400";
    return "text-green-400";
  };

  const handleFileUpload = () => {
    if (uploadFiles.length === 0) {
      toast({ title: "Please select files to upload", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    uploadFiles.forEach((file) => {
      formData.append("files", file);
    });
    if (currentFolder) {
      formData.append("folderId", currentFolder);
    }

    uploadFileMutation.mutate(formData);
  };

  const handleDownload = (file: FileItem) => {
    // Trigger download
    window.open(`/api/documents/download/${file.id}`, "_blank");
    toast({ title: `Downloading ${file.name}` });
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || file.fileType === filterType || (filterType === "folder" && file.type === "folder");
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen cyber-bg p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold cyber-glow mb-2">
            Document Management System
          </h1>
          <p className="text-gray-400">
            Secure cloud storage with encryption and granular access controls
          </p>
        </div>

        {/* Storage Quota Card */}
        {storageQuota && (
          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <HardDrive className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-lg">Storage Usage</h3>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(storageQuota.usedSpace)} of {formatFileSize(storageQuota.totalSpace)} used
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getStorageColor()}`}>
                    {getStoragePercentage().toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-400">
                    {storageQuota.fileCount} files • {storageQuota.folderCount} folders
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStoragePercentage() >= 90 ? "bg-red-400" : getStoragePercentage() >= 75 ? "bg-yellow-400" : "bg-green-400"}`}
                  style={{ width: `${getStoragePercentage()}%` }}
                />
              </div>
              {storageQuota.quotaWarning && (
                <div className="mt-4 flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">Storage quota warning: Consider cleaning up old files</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="cyber-card p-1">
            <TabsTrigger value="files">All Files</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="trash">Trash</TabsTrigger>
          </TabsList>

          {/* All Files Tab */}
          <TabsContent value="files" className="space-y-4">
            {/* Toolbar */}
            <Card className="cyber-card">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Dialog open={showUpload} onOpenChange={setShowUpload}>
                    <DialogTrigger asChild>
                      <Button className="cyber-button">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="cyber-card max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Files</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Files</Label>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                            className="mt-2"
                          />
                          {uploadFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {uploadFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-800 rounded">
                                  <span>{file.name}</span>
                                  <span className="text-gray-400">{formatFileSize(file.size)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowUpload(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleFileUpload} className="cyber-button">
                            Upload {uploadFiles.length} file{uploadFiles.length !== 1 ? "s" : ""}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="cyber-button-outline">
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="cyber-card">
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Folder Name</Label>
                          <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="My Documents"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Description (Optional)</Label>
                          <Textarea
                            value={newFolderDescription}
                            onChange={(e) => setNewFolderDescription(e.target.value)}
                            placeholder="Folder description..."
                            className="mt-2"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              createFolderMutation.mutate({
                                name: newFolderName,
                                description: newFolderDescription,
                                parentId: currentFolder || undefined,
                              })
                            }
                            className="cyber-button"
                          >
                            Create Folder
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {selectedFiles.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => deleteFileMutation.mutate(selectedFiles)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedFiles.length})
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFiles([])}>
                        Clear Selection
                      </Button>
                    </>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="folder">Folders</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="archive">Archives</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files List */}
            <Card className="cyber-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr className="text-left text-sm text-gray-400">
                        <th className="p-4 w-8">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles(filteredFiles.map((f) => f.id));
                              } else {
                                setSelectedFiles([]);
                              }
                            }}
                            checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                          />
                        </th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4">Modified</th>
                        <th className="p-4">Size</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr
                          key={file.id}
                          className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFiles([...selectedFiles, file.id]);
                                } else {
                                  setSelectedFiles(selectedFiles.filter((id) => id !== file.id));
                                }
                              }}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file)}
                              <div>
                                <p className="font-medium">{file.name}</p>
                                {file.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {file.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{file.owner}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-400">{formatDate(file.modifiedDate)}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-400">
                              {file.type === "folder" ? "-" : formatFileSize(file.size)}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {file.isEncrypted && (
                                <Badge className="bg-purple-500/20 text-purple-400">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Encrypted
                                </Badge>
                              )}
                              {file.isShared && (
                                <Badge className="bg-blue-500/20 text-blue-400">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Shared
                                </Badge>
                              )}
                              {file.isFavorite && (
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {file.type !== "folder" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavoriteMutation.mutate(file.id)}
                              >
                                <Star className={`w-4 h-4 ${file.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFileForAction(file);
                                  setShowShare(true);
                                }}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              {!file.isEncrypted && file.type !== "folder" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFileForAction(file);
                                    setShowEncrypt(true);
                                  }}
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredFiles.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No files found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shared Files Tab */}
          <TabsContent value="shared" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Files Shared with Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sharedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-400">
                            Shared by {file.owner} • {formatDate(file.modifiedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{file.permissions[0]?.role || "viewer"}</Badge>
                        {file.type !== "folder" && (
                          <Button size="sm" onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {sharedFiles.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No files shared with you</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Favorite Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favorites.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-400">
                            {formatFileSize(file.size)} • Modified {formatDate(file.modifiedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavoriteMutation.mutate(file.id)}
                        >
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </Button>
                        {file.type !== "folder" && (
                          <Button size="sm" onClick={() => handleDownload(file)}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No favorite files</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {activity.action === "upload" && <Upload className="w-4 h-4 text-blue-400" />}
                        {activity.action === "download" && <Download className="w-4 h-4 text-green-400" />}
                        {activity.action === "share" && <Share2 className="w-4 h-4 text-purple-400" />}
                        {activity.action === "delete" && <Trash2 className="w-4 h-4 text-red-400" />}
                        {activity.action === "edit" && <Edit className="w-4 h-4 text-yellow-400" />}
                        {activity.action === "view" && <Eye className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.userName}</p>
                        <p className="text-sm text-gray-400">
                          {activity.action} <span className="text-white">{activity.fileName}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trash Tab */}
          <TabsContent value="trash" className="space-y-4">
            <Card className="cyber-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Trash
                  </CardTitle>
                  {deletedFiles.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => permanentDeleteMutation.mutate(deletedFiles.map((f) => f.id))}
                    >
                      Empty Trash
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deletedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-400">
                            Deleted {formatDate(file.deletedDate || file.modifiedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreFileMutation.mutate([file.id])}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => permanentDeleteMutation.mutate([file.id])}
                        >
                          Delete Forever
                        </Button>
                      </div>
                    </div>
                  ))}
                  {deletedFiles.length === 0 && (
                    <p className="text-center text-gray-400 py-8">Trash is empty</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Encryption Dialog */}
        <Dialog open={showEncrypt} onOpenChange={setShowEncrypt}>
          <DialogContent className="cyber-card">
            <DialogHeader>
              <DialogTitle>Encrypt File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-400">Important</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Keep your encryption password safe. If you lose it, the file cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Encryption Method</Label>
                <Select value={encryptionMethod} onValueChange={(v: any) => setEncryptionMethod(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256 (Recommended)</SelectItem>
                    <SelectItem value="AES-128">AES-128 (Faster)</SelectItem>
                    <SelectItem value="RSA-2048">RSA-2048 (Most Secure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Encryption Password</Label>
                <Input
                  type="password"
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEncrypt(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedFileForAction &&
                    encryptFileMutation.mutate({
                      fileId: selectedFileForAction.id,
                      method: encryptionMethod,
                      password: encryptionPassword,
                    })
                  }
                  className="cyber-button"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Encrypt File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
