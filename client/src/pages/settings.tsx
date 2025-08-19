import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Brain, Bell, Database, Lock, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // AI Settings
    aiEnabled: true,
    autoBlockThreshold: 70,
    analysisSpeed: "balanced",
    modelSelection: "chatgpt-4o",
    
    // Moderation Settings
    requireManualReview: false,
    autoApproveThreshold: 30,
    escalationThreshold: 80,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 60,
    ipWhitelist: "",
    auditLogging: true,
    
    // Notification Settings
    emailAlerts: true,
    slackWebhook: "",
    highRiskAlerts: true,
    dailyReports: true,
    
    // Performance Settings
    maxConcurrentAnalysis: 10,
    batchSize: 50,
    retentionDays: 90
  });

  const { toast } = useToast();

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Configuration has been updated successfully"
    });
  };

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">System Settings</h1>
            <p className="text-muted-foreground">Platform Configuration</p>
          </div>
          <Button onClick={saveSettings} className="neon-button" data-testid="save-settings">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 cyber-card">
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Engine</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Engine Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="cyber-card neural-network">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-primary cyber-pulse" />
                  <span className="cyber-text-glow">AI ANALYSIS ENGINE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-enabled">Enable AI Analysis</Label>
                      <Switch
                        id="ai-enabled"
                        checked={settings.aiEnabled}
                        onCheckedChange={(checked) => updateSetting('aiEnabled', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Auto-Block Threshold: {settings.autoBlockThreshold}%</Label>
                      <Slider
                        value={[settings.autoBlockThreshold]}
                        onValueChange={(value) => updateSetting('autoBlockThreshold', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model-selection">AI Model</Label>
                      <Select value={settings.modelSelection} onValueChange={(value) => updateSetting('modelSelection', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chatgpt-4o">ChatGPT-4o (Recommended)</SelectItem>
                          <SelectItem value="chatgpt-4">ChatGPT-4</SelectItem>
                          <SelectItem value="claude-3">Claude-3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="analysis-speed">Analysis Speed</Label>
                      <Select value={settings.analysisSpeed} onValueChange={(value) => updateSetting('analysisSpeed', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">Fast (Lower Accuracy)</SelectItem>
                          <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                          <SelectItem value="thorough">Thorough (Higher Accuracy)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 cyber-card border border-primary/20">
                      <h4 className="font-medium mb-2">Model Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Accuracy Rate:</span>
                          <span className="text-green-400">96.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Processing Time:</span>
                          <span className="text-primary">1.2s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Capacity:</span>
                          <span className="text-blue-400">1.2M items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Settings */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <span>Moderation Workflows</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manual-review">Require Manual Review</Label>
                      <Switch
                        id="manual-review"
                        checked={settings.requireManualReview}
                        onCheckedChange={(checked) => updateSetting('requireManualReview', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Auto-Approve Threshold: {settings.autoApproveThreshold}%</Label>
                      <Slider
                        value={[settings.autoApproveThreshold]}
                        onValueChange={(value) => updateSetting('autoApproveThreshold', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Escalation Threshold: {settings.escalationThreshold}%</Label>
                      <Slider
                        value={[settings.escalationThreshold]}
                        onValueChange={(value) => updateSetting('escalationThreshold', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="p-4 cyber-card border border-primary/20">
                      <h4 className="font-medium mb-2">Workflow Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Pending Review:</span>
                          <span className="text-yellow-400">23 items</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Review Time:</span>
                          <span className="text-primary">2.3 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-6 h-6 text-primary" />
                  <span>Security Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="2fa">Two-Factor Authentication</Label>
                      <Switch
                        id="2fa"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-logging">Audit Logging</Label>
                      <Switch
                        id="audit-logging"
                        checked={settings.auditLogging}
                        onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="glass-effect"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip-whitelist">IP Whitelist (comma-separated)</Label>
                      <Input
                        id="ip-whitelist"
                        value={settings.ipWhitelist}
                        onChange={(e) => updateSetting('ipWhitelist', e.target.value)}
                        placeholder="192.168.1.0/24, 10.0.0.0/8"
                        className="glass-effect"
                      />
                    </div>

                    <div className="p-4 cyber-card border border-green-500/20">
                      <h4 className="font-medium mb-2 text-green-400">Security Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Threat Level:</span>
                          <span className="text-yellow-400">MEDIUM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed Logins (24h):</span>
                          <span className="text-red-400">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Security Scan:</span>
                          <span className="text-green-400">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-6 h-6 text-primary" />
                  <span>Alert Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-alerts">Email Alerts</Label>
                      <Switch
                        id="email-alerts"
                        checked={settings.emailAlerts}
                        onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-risk-alerts">High Risk Alerts</Label>
                      <Switch
                        id="high-risk-alerts"
                        checked={settings.highRiskAlerts}
                        onCheckedChange={(checked) => updateSetting('highRiskAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily-reports">Daily Reports</Label>
                      <Switch
                        id="daily-reports"
                        checked={settings.dailyReports}
                        onCheckedChange={(checked) => updateSetting('dailyReports', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                      <Input
                        id="slack-webhook"
                        value={settings.slackWebhook}
                        onChange={(e) => updateSetting('slackWebhook', e.target.value)}
                        placeholder="https://hooks.slack.com/..."
                        className="glass-effect"
                      />
                    </div>

                    <div className="p-4 cyber-card border border-blue-500/20">
                      <h4 className="font-medium mb-2 text-blue-400">Notification Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Alerts Sent Today:</span>
                          <span className="text-primary">47</span>
                        </div>
                        <div className="flex justify-between">
                          <span>High Priority:</span>
                          <span className="text-red-400">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Rate:</span>
                          <span className="text-green-400">99.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-6 h-6 text-primary" />
                  <span>Performance Tuning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-concurrent">Max Concurrent Analysis</Label>
                      <Input
                        id="max-concurrent"
                        type="number"
                        value={settings.maxConcurrentAnalysis}
                        onChange={(e) => updateSetting('maxConcurrentAnalysis', parseInt(e.target.value))}
                        className="glass-effect"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch-size">Batch Size</Label>
                      <Input
                        id="batch-size"
                        type="number"
                        value={settings.batchSize}
                        onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
                        className="glass-effect"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="retention-days">Data Retention (days)</Label>
                      <Input
                        id="retention-days"
                        type="number"
                        value={settings.retentionDays}
                        onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value))}
                        className="glass-effect"
                      />
                    </div>

                    <div className="p-4 cyber-card border border-purple-500/20">
                      <h4 className="font-medium mb-2 text-purple-400">System Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CPU Usage:</span>
                          <span className="text-green-400">34%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span className="text-yellow-400">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Queue Depth:</span>
                          <span className="text-blue-400">23 items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}