import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Shield,
  Key,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Calendar,
  HardDrive,
} from "lucide-react";

export default function VaultPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Mock vault data - in production this would come from secure storage
  const vaultData = {
    totalFiles: 15847,
    encryptedSize: "2.4 TB",
    securityLevel: "AES-256",
    lastBackup: "2025-08-29T18:00:00Z",
    categories: [
      { name: "Flagged Content", count: 8934, size: "1.2 TB" },
      { name: "Evidence Files", count: 3421, size: "756 GB" },
      { name: "User Reports", count: 2108, size: "234 GB" },
      { name: "System Backups", count: 1384, size: "412 GB" },
    ],
    recentFiles: [
      {
        id: "vault-001",
        name: "high_risk_content_batch_001.enc",
        category: "Flagged Content",
        size: "45.2 MB",
        encrypted: true,
        uploadedAt: "2025-08-29T17:30:00Z",
        accessLevel: "Admin Only",
      },
      {
        id: "vault-002",
        name: "user_report_evidence_789.enc",
        category: "Evidence Files",
        size: "12.8 MB",
        encrypted: true,
        uploadedAt: "2025-08-29T16:45:00Z",
        accessLevel: "Moderator",
      },
      {
        id: "vault-003",
        name: "compliance_audit_2025_08.enc",
        category: "System Backups",
        size: "234.5 MB",
        encrypted: true,
        uploadedAt: "2025-08-29T15:20:00Z",
        accessLevel: "Legal Team",
      },
    ],
  };

  const handleFileUpload = async () => {
    setIsUploading(true);
    try {
      // Simulate secure file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "File Uploaded Securely",
        description: "File encrypted and stored in secure vault",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to secure vault",
        variant: "destructive",
      });
    }
    setIsUploading(false);
  };

  const handleFileAccess = (fileId: string) => {
    toast({
      title: "Access Logged",
      description: `File access logged for audit trail: ${fileId}`,
    });
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Security Vault
            </h1>
            <p className="text-muted-foreground">
              Encrypted Content Storage & Evidence Management
            </p>
          </div>
          <Button
            onClick={handleFileUpload}
            disabled={isUploading}
            className="neon-button"
            data-testid="upload-vault-button"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to Vault
              </>
            )}
          </Button>
        </div>

        {/* Vault Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-card bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <CardContent className="p-4 text-center">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">
                {vaultData.totalFiles.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Files</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">
                {vaultData.encryptedSize}
              </div>
              <div className="text-xs text-muted-foreground">
                Encrypted Data
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <CardContent className="p-4 text-center">
              <Key className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">
                {vaultData.securityLevel}
              </div>
              <div className="text-xs text-muted-foreground">Encryption</div>
            </CardContent>
          </Card>

          <Card className="cyber-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">
                {new Date(vaultData.lastBackup).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">Last Backup</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search encrypted files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 cyber-input"
                    data-testid="search-vault-input"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "flagged", "evidence", "reports", "backups"].map(
                  (category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category ? "neon-button" : ""
                      }
                      data-testid={`filter-${category}-button`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Categories */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <span className="cyber-text-glow">VAULT CATEGORIES</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vaultData.categories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {category.count.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400 cyber-pulse" />
              <span className="cyber-text-glow">RECENT VAULT ACTIVITY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vaultData.recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 cyber-card border border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.category} • {file.size} •{" "}
                        {new Date(file.uploadedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        file.accessLevel === "Admin Only"
                          ? "destructive"
                          : "default"
                      }
                      className="text-xs"
                    >
                      {file.accessLevel}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileAccess(file.id)}
                      className="text-xs"
                      data-testid={`access-file-${file.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Access
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      data-testid={`download-file-${file.id}`}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="cyber-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-green-400">SECURITY STATUS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">ACTIVE</div>
                <div className="text-sm text-muted-foreground">
                  Encryption Status
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">SECURE</div>
                <div className="text-sm text-muted-foreground">
                  Access Control
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  COMPLIANT
                </div>
                <div className="text-sm text-muted-foreground">
                  Legal Standards
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
