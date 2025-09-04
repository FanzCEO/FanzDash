import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Zap,
  Terminal,
  Database,
  Key,
} from "lucide-react";

export function SecurityVault() {
  const [masterPassword, setMasterPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Vault Access Control */}
      <Card className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 via-transparent to-destructive/20 animate-pulse"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-destructive/20 border border-destructive/50">
                <Shield className="w-6 h-6 text-destructive cyber-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground cyber-text-glow">
                  ENCRYPTED VAULT
                </h2>
                <p className="text-sm text-muted-foreground">
                  Executive Access Required
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${isUnlocked ? "bg-secondary" : "bg-destructive"} cyber-pulse`}
              ></div>
              <span className="text-sm font-mono">
                {isUnlocked ? "UNLOCKED" : "SECURED"}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {!isUnlocked ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 cyber-pulse" />
                <h3 className="text-lg font-semibold mb-2">
                  Master Password Required
                </h3>
                <p className="text-muted-foreground mb-6">
                  Access to illegal/sensitive content evidence
                </p>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter master password"
                      className="pl-10 neon-border font-mono"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      data-testid="input-master-password"
                    />
                  </div>
                  <Button
                    className="w-full neon-button bg-destructive/20 hover:bg-destructive text-destructive hover:text-foreground"
                    onClick={() => setIsUnlocked(true)}
                    disabled={!masterPassword}
                    data-testid="button-unlock-vault"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    UNLOCK VAULT
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-destructive">
                      247
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vaulted Items
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">12</div>
                    <div className="text-sm text-muted-foreground">
                      Critical Severity
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">5</div>
                    <div className="text-sm text-muted-foreground">
                      Executive Reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <VaultContent />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VaultContent() {
  const vaultItems = [
    {
      id: "vault-001",
      type: "CSAM",
      severity: "critical",
      contentType: "image",
      description: "Suspected child exploitation material",
      encryptionLevel: "AES-256",
      accessCount: 2,
      lastAccessed: "2024-01-15",
      vaultedBy: "admin-001",
    },
    {
      id: "vault-002",
      type: "terrorism",
      severity: "high",
      contentType: "video",
      description: "Terrorist recruitment material",
      encryptionLevel: "AES-256",
      accessCount: 5,
      lastAccessed: "2024-01-14",
      vaultedBy: "admin-002",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Vault Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold cyber-text-glow">VAULT CONTENTS</h3>
          <p className="text-sm text-muted-foreground">
            All access is logged and monitored
          </p>
        </div>
        <Button
          variant="outline"
          className="neon-button text-destructive border-destructive"
        >
          <Terminal className="w-4 h-4 mr-2" />
          EXPORT LOG
        </Button>
      </div>

      {/* Vault Items Grid */}
      <div className="grid gap-4">
        {vaultItems.map((item) => (
          <Card
            key={item.id}
            className="cyber-card bg-destructive/5 border-destructive/30 relative"
          >
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="font-mono">
                {item.severity.toUpperCase()}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded bg-destructive/20">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold">
                        {item.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.type}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-mono">{item.contentType}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Encryption:</span>
                    <span className="font-mono text-secondary">
                      {item.encryptionLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Vaulted By:</span>
                    <span className="font-mono">{item.vaultedBy}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Access Count:</span>
                    <span className="font-mono text-accent">
                      {item.accessCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last Access:</span>
                    <span className="font-mono">{item.lastAccessed}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 neon-button bg-destructive/20 text-destructive hover:bg-destructive hover:text-foreground"
                        data-testid={`button-view-${item.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        VIEW
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl cyber-card">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <span>VAULT ITEM: {item.id}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                          <p className="text-sm text-destructive font-medium mb-2">
                            ⚠️ WARNING: SENSITIVE CONTENT
                          </p>
                          <p className="text-sm text-muted-foreground">
                            This content has been encrypted and vaulted due to
                            its illegal nature. Access is strictly monitored and
                            logged.
                          </p>
                        </div>
                        <div className="text-center py-8">
                          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Content preview disabled for security
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Full decryption requires additional authorization
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Access Log */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-secondary" />
            <span>Recent Vault Access Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">2024-01-15 14:23:07</span>
              <span className="text-accent">admin-001</span>
              <span className="text-destructive">VAULT ACCESS</span>
              <span className="text-secondary">vault-001</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">2024-01-15 10:45:12</span>
              <span className="text-accent">executive-001</span>
              <span className="text-primary">VAULT REVIEW</span>
              <span className="text-secondary">vault-002</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">2024-01-14 16:33:21</span>
              <span className="text-accent">admin-002</span>
              <span className="text-destructive">ITEM VAULTED</span>
              <span className="text-secondary">vault-003</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
