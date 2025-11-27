import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface HuggingFaceModel {
  id: string;
  name: string;
  description: string | null;
  modelId: string;
  task: string;
  provider: string;
  apiEndpoint: string | null;
  apiKey: string | null;
  parameters: any;
  contentFiltering: any;
  rateLimiting: any;
  isActive: boolean;
  isPremium: boolean;
  usageStats: any;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MODEL_TASKS = [
  { value: "text-generation", label: "Text Generation" },
  { value: "text-classification", label: "Text Classification" },
  { value: "token-classification", label: "Token Classification" },
  { value: "question-answering", label: "Question Answering" },
  { value: "summarization", label: "Summarization" },
  { value: "translation", label: "Translation" },
  { value: "text2text-generation", label: "Text-to-Text Generation" },
  { value: "sentiment-analysis", label: "Sentiment Analysis" },
  { value: "image-classification", label: "Image Classification" },
  { value: "object-detection", label: "Object Detection" },
  { value: "image-segmentation", label: "Image Segmentation" },
  { value: "text-to-image", label: "Text to Image" },
  { value: "image-to-text", label: "Image to Text" },
  { value: "automatic-speech-recognition", label: "Speech Recognition" },
  { value: "audio-classification", label: "Audio Classification" },
  { value: "text-to-speech", label: "Text to Speech" },
  { value: "conversational", label: "Conversational" },
  { value: "feature-extraction", label: "Feature Extraction" },
  { value: "fill-mask", label: "Fill Mask" },
  { value: "zero-shot-classification", label: "Zero-Shot Classification" },
];

export default function HuggingFaceModelManager() {
  const [models, setModels] = useState<HuggingFaceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<HuggingFaceModel | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modelId: "",
    task: "text-generation",
    provider: "huggingface",
    apiEndpoint: "",
    apiKey: "",
    parameters: "{}",
    contentFiltering: "{}",
    rateLimiting: "{}",
    isActive: true,
    isPremium: false,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/huggingface/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data.models || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        parameters: JSON.parse(formData.parameters || "{}"),
        contentFiltering: JSON.parse(formData.contentFiltering || "{}"),
        rateLimiting: JSON.parse(formData.rateLimiting || "{}"),
      };

      const response = await fetch("/api/huggingface/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create model");

      await fetchModels();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        parameters: JSON.parse(formData.parameters || "{}"),
        contentFiltering: JSON.parse(formData.contentFiltering || "{}"),
        rateLimiting: JSON.parse(formData.rateLimiting || "{}"),
      };

      const response = await fetch(`/api/huggingface/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update model");

      await fetchModels();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/huggingface/models/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete model");

      await fetchModels();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (model: HuggingFaceModel) => {
    try {
      setTestLoading(true);
      setTestResult(null);

      const response = await fetch(`/api/huggingface/models/${model.id}/test`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to test model");

      const data = await response.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/huggingface/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error("Failed to update model status");

      await fetchModels();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      modelId: "",
      task: "text-generation",
      provider: "huggingface",
      apiEndpoint: "",
      apiKey: "",
      parameters: "{}",
      contentFiltering: "{}",
      rateLimiting: "{}",
      isActive: true,
      isPremium: false,
    });
    setSelectedModel(null);
  };

  const openEditDialog = (model?: HuggingFaceModel) => {
    if (model) {
      setSelectedModel(model);
      setFormData({
        name: model.name,
        description: model.description || "",
        modelId: model.modelId,
        task: model.task,
        provider: model.provider,
        apiEndpoint: model.apiEndpoint || "",
        apiKey: model.apiKey || "",
        parameters: JSON.stringify(model.parameters || {}, null, 2),
        contentFiltering: JSON.stringify(model.contentFiltering || {}, null, 2),
        rateLimiting: JSON.stringify(model.rateLimiting || {}, null, 2),
        isActive: model.isActive,
        isPremium: model.isPremium,
      });
    } else {
      resetForm();
    }
    setIsEditDialogOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8" />
            HuggingFace AI Models
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and configure AI models from HuggingFace for your platform
          </p>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedModel ? "Edit Model" : "Add New Model"}</DialogTitle>
              <DialogDescription>
                Configure a HuggingFace AI model for your platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GPT-2 Text Generator"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the model"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelId">HuggingFace Model ID</Label>
                <Input
                  id="modelId"
                  value={formData.modelId}
                  onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                  placeholder="e.g., gpt2 or username/model-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task">Task Type</Label>
                <Select value={formData.task} onValueChange={(value) => setFormData({ ...formData, task: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_TASKS.map((task) => (
                      <SelectItem key={task.value} value={task.value}>
                        {task.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="HuggingFace API Key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Textarea
                  id="parameters"
                  value={formData.parameters}
                  onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                  placeholder='{"temperature": 0.7, "max_tokens": 100}'
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPremium">Premium Model</Label>
                <Switch
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => (selectedModel ? handleUpdate(selectedModel.id) : handleCreate())}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedModel ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !models.length ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card key={model.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {model.name}
                      {model.isPremium && <Badge variant="secondary">Premium</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">{model.description}</CardDescription>
                  </div>
                  <Switch
                    checked={model.isActive}
                    onCheckedChange={(checked) => handleToggleActive(model.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Model ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{model.modelId}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">Task Type</div>
                  <Badge variant="outline">{model.task}</Badge>
                </div>

                {model.usageStats && model.usageStats.totalRequests > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Usage Stats</div>
                    <div className="text-sm text-muted-foreground">
                      {model.usageStats.totalRequests} requests • Avg {model.usageStats.avgLatency}ms
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedModel(model);
                      setIsTestDialogOpen(true);
                      handleTest(model);
                    }}
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(model)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(model.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {models.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bot className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Models Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first HuggingFace AI model to get started
            </p>
            <Button onClick={() => openEditDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Model: {selectedModel?.name}</DialogTitle>
            <DialogDescription>Running test inference on the model</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {testLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                {testResult.success ? (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      Test successful! Latency: {testResult.latency}ms
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>{testResult.error}</AlertDescription>
                  </Alert>
                )}
                {testResult.data && (
                  <div>
                    <Label>Response</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
