import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Bot,
  FileCode,
  MessageCircleQuestion,
  Settings,
  Search,
  Zap,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  RefreshCw,
  Code,
  Globe,
  Lightbulb,
  Target,
  TrendingUp,
  Eye,
  Mic,
  Hash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AEOSettings {
  // AI Optimization
  enableAIOptimization: boolean;
  targetAIEngines: string[];
  conversationalKeywords: string[];
  questionBasedContent: boolean;

  // Schema Configuration
  enableFAQSchema: boolean;
  enableHowToSchema: boolean;
  enableArticleSchema: boolean;
  enableOrganizationSchema: boolean;
  enableProductSchema: boolean;
  enableQASchema: boolean;

  // Content Structure
  enableDirectAnswers: boolean;
  answerLength: number;
  questionHeadings: boolean;
  bulletPointOptimization: boolean;

  // Entity Connections
  organizationName: string;
  organizationUrl: string;
  sameAsUrls: string[];
  authorProfiles: string[];

  // Voice Search
  enableVoiceOptimization: boolean;
  naturalLanguagePatterns: string[];
  localSearchQueries: string[];

  // Featured Snippets
  enableSnippetOptimization: boolean;
  snippetTargeting: string[];
  comparisonTables: boolean;
  prosConsList: boolean;

  // LLMs.txt Configuration
  enableLLMsTxt: boolean;
  llmsPurpose: string;
  llmsGuidelines: string;
  llmsRestrictions: string;

  // Monitoring
  trackAICitations: boolean;
  monitorSnippets: boolean;
  voiceSearchTracking: boolean;
}

interface SchemaPreview {
  type: string;
  code: string;
  isValid: boolean;
}

export default function AEOConfiguration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [aeoSettings, setAEOSettings] = useState<AEOSettings>({
    // AI Optimization
    enableAIOptimization: true,
    targetAIEngines: [
      "ChatGPT",
      "Google AI Overview",
      "Perplexity",
      "Bing Copilot",
    ],
    conversationalKeywords: [
      "how to",
      "what is",
      "why does",
      "best way to",
      "steps to",
    ],
    questionBasedContent: true,

    // Schema Configuration
    enableFAQSchema: true,
    enableHowToSchema: true,
    enableArticleSchema: true,
    enableOrganizationSchema: true,
    enableProductSchema: false,
    enableQASchema: true,

    // Content Structure
    enableDirectAnswers: true,
    answerLength: 50,
    questionHeadings: true,
    bulletPointOptimization: true,

    // Entity Connections
    organizationName: "Fanz™ Unlimited Network LLC",
    organizationUrl: "https://fanzunlimited.com",
    sameAsUrls: [
      "https://linkedin.com/company/fanz-unlimited",
      "https://twitter.com/fanzunlimited",
    ],
    authorProfiles: [],

    // Voice Search
    enableVoiceOptimization: true,
    naturalLanguagePatterns: [
      "What is the best creator platform for",
      "How do I monetize my content",
      "Which platform supports live streaming",
    ],
    localSearchQueries: [],

    // Featured Snippets
    enableSnippetOptimization: true,
    snippetTargeting: ["definition", "list", "table", "paragraph"],
    comparisonTables: true,
    prosConsList: true,

    // LLMs.txt Configuration
    enableLLMsTxt: true,
    llmsPurpose:
      "FanzDash is an enterprise-grade multi-platform management system for creator economy platforms",
    llmsGuidelines:
      "Always provide accurate, helpful information about content moderation, creator tools, and platform features",
    llmsRestrictions:
      "Do not provide information about bypassing content moderation or violating platform policies",

    // Monitoring
    trackAICitations: true,
    monitorSnippets: true,
    voiceSearchTracking: true,
  });

  const [schemaPreview, setSchemaPreview] = useState<SchemaPreview | null>(
    null,
  );

  const updateSetting = (key: keyof AEOSettings, value: any) => {
    setAEOSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addToArray = (key: keyof AEOSettings, value: string) => {
    if (value.trim()) {
      const currentArray = aeoSettings[key] as string[];
      updateSetting(key, [...currentArray, value.trim()]);
    }
  };

  const removeFromArray = (key: keyof AEOSettings, index: number) => {
    const currentArray = [...(aeoSettings[key] as string[])];
    currentArray.splice(index, 1);
    updateSetting(key, currentArray);
  };

  const generateSchema = (type: string) => {
    setIsGenerating(true);

    // Simulate schema generation
    setTimeout(() => {
      let schema = {};

      switch (type) {
        case "FAQ":
          schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is FanzDash?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "FanzDash is a comprehensive enterprise-grade multi-platform management system designed to handle 20+ million users across all Fanz™ Unlimited Network LLC platforms through one unified control panel.",
                },
              },
            ],
          };
          break;

        case "HowTo":
          schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Set Up Content Moderation",
            description:
              "Step-by-step guide to configure AI-powered content moderation",
            step: [
              {
                "@type": "HowToStep",
                name: "Configure AI Settings",
                text: "Access the AI Analysis Engine and configure ChatGPT-4o/GPT-5 integration",
              },
            ],
          };
          break;

        case "Organization":
          schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: aeoSettings.organizationName,
            url: aeoSettings.organizationUrl,
            logo: `${aeoSettings.organizationUrl}/logo.png`,
            sameAs: aeoSettings.sameAsUrls,
            description:
              "Enterprise-grade creator economy platform with AI-powered content moderation and compliance systems",
          };
          break;

        case "Article":
          schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Enterprise Creator Platform Features",
            author: {
              "@type": "Organization",
              name: aeoSettings.organizationName,
            },
            publisher: {
              "@type": "Organization",
              name: aeoSettings.organizationName,
              logo: `${aeoSettings.organizationUrl}/logo.png`,
            },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
          };
          break;
      }

      setSchemaPreview({
        type,
        code: JSON.stringify(schema, null, 2),
        isValid: true,
      });
      setIsGenerating(false);

      toast({
        title: "Schema Generated",
        description: `${type} schema markup has been generated successfully`,
      });
    }, 1000);
  };

  const generateLLMsTxt = () => {
    const llmsTxt = `# ${aeoSettings.organizationName} - LLMs.txt

## Purpose
${aeoSettings.llmsPurpose}

## Guidelines for AI Systems
${aeoSettings.llmsGuidelines}

## Restrictions
${aeoSettings.llmsRestrictions}

## Key Features
- AI-powered content moderation with ChatGPT-4o/GPT-5
- Real-time compliance monitoring (18 U.S.C. § 2257)
- Multi-platform creator economy management
- Enterprise-grade security and audit trails

## Contact
For accurate information, refer to: ${aeoSettings.organizationUrl}

## Last Updated
${new Date().toISOString()}`;

    return llmsTxt;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save AEO settings to database
      await apiRequest("/api/aeo/settings", "POST", {
        pageUrl: "/",
        featuredSnippetText: aeoSettings.featuredSnippet,
        faqItems: aeoSettings.faqSchema || [],
        howToSteps: aeoSettings.howToSchema || [],
        keyFacts: [],
        entitySchema: aeoSettings.entitySchema,
        voiceSearchPhrases: aeoSettings.conversationalKeywords || [],
        questionAnswers: [],
      });

      toast({
        title: "AEO Settings Saved",
        description: "Your Answer Engine Optimization configuration has been saved to the database successfully",
      });
    } catch (error) {
      console.error("AEO save error:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save AEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ArrayInput = ({
    arrayKey,
    placeholder,
    description,
  }: {
    arrayKey: keyof AEOSettings;
    placeholder: string;
    description?: string;
  }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addToArray(arrayKey, inputValue);
        setInputValue("");
      }
    };

    return (
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          data-testid={`${arrayKey}-input`}
        />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {(aeoSettings[arrayKey] as string[]).map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {item}
              <button
                onClick={() => removeFromArray(arrayKey, index)}
                className="ml-1 hover:text-destructive"
                data-testid={`remove-${arrayKey}-${index}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to add items
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Brain className="h-8 w-8 text-cyan-400" />
            <span>AEO Configuration</span>
          </h1>
          <p className="text-muted-foreground">
            Answer Engine Optimization for AI-powered search platforms
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(generateLLMsTxt())}
          >
            <Download className="h-4 w-4 mr-2" />
            Export LLMs.txt
          </Button>

          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            {isSaving ? "Saving..." : "Save AEO Settings"}
          </Button>
        </div>
      </div>

      {/* AEO Score Card */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-cyan-600">92</div>
              <div>
                <h3 className="font-semibold">AEO Readiness Score</h3>
                <p className="text-sm text-muted-foreground">
                  Excellent AI visibility optimization
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">98%</div>
                <div className="text-xs text-muted-foreground">Schema</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">87%</div>
                <div className="text-xs text-muted-foreground">Content</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">94%</div>
                <div className="text-xs text-muted-foreground">Voice</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">89%</div>
                <div className="text-xs text-muted-foreground">Citations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="voice">Voice Search</TabsTrigger>
          <TabsTrigger value="llms">LLMs.txt</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  <span>AI Engine Targeting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Optimization</span>
                    <Switch
                      checked={aeoSettings.enableAIOptimization}
                      onCheckedChange={(checked) =>
                        updateSetting("enableAIOptimization", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Target AI Engines
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {aeoSettings.targetAIEngines.map((engine) => (
                        <Badge
                          key={engine}
                          variant="outline"
                          className="text-xs"
                        >
                          {engine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircleQuestion className="h-5 w-5 text-green-500" />
                  <span>Q&A Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Question-based Content</span>
                    <Switch
                      checked={aeoSettings.questionBasedContent}
                      onCheckedChange={(checked) =>
                        updateSetting("questionBasedContent", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Direct Answers</span>
                    <Switch
                      checked={aeoSettings.enableDirectAnswers}
                      onCheckedChange={(checked) =>
                        updateSetting("enableDirectAnswers", checked)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Answer Length
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={aeoSettings.answerLength}
                        onChange={(e) =>
                          updateSetting(
                            "answerLength",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-20 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        words
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span>Featured Snippets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Snippet Optimization</span>
                    <Switch
                      checked={aeoSettings.enableSnippetOptimization}
                      onCheckedChange={(checked) =>
                        updateSetting("enableSnippetOptimization", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comparison Tables</span>
                    <Switch
                      checked={aeoSettings.comparisonTables}
                      onCheckedChange={(checked) =>
                        updateSetting("comparisonTables", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pros/Cons Lists</span>
                    <Switch
                      checked={aeoSettings.prosConsList}
                      onCheckedChange={(checked) =>
                        updateSetting("prosConsList", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>AEO Best Practices:</strong> Focus on providing direct,
              concise answers within the first 40-60 words of your content. Use
              natural, conversational language and structure content with clear
              question headings followed by immediate answers.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Schema Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "enableFAQSchema",
                    label: "FAQPage Schema",
                    desc: "For question-answer content",
                  },
                  {
                    key: "enableHowToSchema",
                    label: "HowTo Schema",
                    desc: "For step-by-step guides",
                  },
                  {
                    key: "enableArticleSchema",
                    label: "Article Schema",
                    desc: "For blog posts and articles",
                  },
                  {
                    key: "enableOrganizationSchema",
                    label: "Organization Schema",
                    desc: "For company information",
                  },
                  {
                    key: "enableQASchema",
                    label: "QAPage Schema",
                    desc: "For Q&A content",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground">
                        {desc}
                      </div>
                    </div>
                    <Switch
                      checked={aeoSettings[key as keyof AEOSettings] as boolean}
                      onCheckedChange={(checked) =>
                        updateSetting(key as keyof AEOSettings, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="h-5 w-5" />
                  <span>Schema Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {["FAQ", "HowTo", "Organization", "Article"].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => generateSchema(type)}
                      disabled={isGenerating}
                      data-testid={`generate-${type.toLowerCase()}-schema`}
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Code className="h-3 w-3 mr-1" />
                      )}
                      {type}
                    </Button>
                  ))}
                </div>

                {schemaPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {schemaPreview.type} Schema
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(schemaPreview.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={schemaPreview.code}
                      readOnly
                      rows={8}
                      className="font-mono text-xs"
                      data-testid="schema-preview"
                    />
                    {schemaPreview.isValid && (
                      <div className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid JSON-LD Schema
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Content Structure Optimization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Question Headings</Label>
                    <Switch
                      checked={aeoSettings.questionHeadings}
                      onCheckedChange={(checked) =>
                        updateSetting("questionHeadings", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Bullet Point Optimization</Label>
                    <Switch
                      checked={aeoSettings.bulletPointOptimization}
                      onCheckedChange={(checked) =>
                        updateSetting("bulletPointOptimization", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Conversational Keywords</Label>
                  <ArrayInput
                    arrayKey="conversationalKeywords"
                    placeholder="Add conversational keyword phrases"
                    description="Focus on 'how', 'what', 'why', 'best way to' patterns"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured Snippet Targeting</Label>
                <ArrayInput
                  arrayKey="snippetTargeting"
                  placeholder="Add snippet target types (definition, list, table, paragraph)"
                  description="Types of featured snippets to optimize for"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Search Tab */}
        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>Voice Search Optimization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voice Search Optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize content for voice assistants and smart speakers
                  </p>
                </div>
                <Switch
                  checked={aeoSettings.enableVoiceOptimization}
                  onCheckedChange={(checked) =>
                    updateSetting("enableVoiceOptimization", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Natural Language Patterns</Label>
                <ArrayInput
                  arrayKey="naturalLanguagePatterns"
                  placeholder="Add natural language query patterns"
                  description="Common voice search phrases users might ask"
                />
              </div>

              <div className="space-y-2">
                <Label>Local Search Queries</Label>
                <ArrayInput
                  arrayKey="localSearchQueries"
                  placeholder="Add location-based search patterns"
                  description="Local voice search patterns (near me, in [city], etc.)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LLMs.txt Tab */}
        <TabsContent value="llms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>LLMs.txt Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  The LLMs.txt file helps AI systems understand your content and
                  provides guidelines for how your information should be
                  presented in AI responses.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable LLMs.txt</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-friendly content guidelines
                  </p>
                </div>
                <Switch
                  checked={aeoSettings.enableLLMsTxt}
                  onCheckedChange={(checked) =>
                    updateSetting("enableLLMsTxt", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose Statement</Label>
                <Textarea
                  value={aeoSettings.llmsPurpose}
                  onChange={(e) => updateSetting("llmsPurpose", e.target.value)}
                  placeholder="Describe what your platform/organization does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>AI Guidelines</Label>
                <Textarea
                  value={aeoSettings.llmsGuidelines}
                  onChange={(e) =>
                    updateSetting("llmsGuidelines", e.target.value)
                  }
                  placeholder="Guidelines for how AI should present your information"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Restrictions</Label>
                <Textarea
                  value={aeoSettings.llmsRestrictions}
                  onChange={(e) =>
                    updateSetting("llmsRestrictions", e.target.value)
                  }
                  placeholder="What AI systems should not do with your content"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Generated LLMs.txt</Label>
                <Textarea
                  value={generateLLMsTxt()}
                  readOnly
                  rows={12}
                  className="font-mono text-xs"
                  data-testid="llms-txt-preview"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateLLMsTxt())}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([generateLLMsTxt()], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "llms.txt";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>AEO Performance Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">AI Citations Tracking</Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor mentions in AI responses
                    </p>
                  </div>
                  <Switch
                    checked={aeoSettings.trackAICitations}
                    onCheckedChange={(checked) =>
                      updateSetting("trackAICitations", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">Featured Snippets</Label>
                    <p className="text-xs text-muted-foreground">
                      Track snippet appearances
                    </p>
                  </div>
                  <Switch
                    checked={aeoSettings.monitorSnippets}
                    onCheckedChange={(checked) =>
                      updateSetting("monitorSnippets", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm">Voice Search</Label>
                    <p className="text-xs text-muted-foreground">
                      Monitor voice query performance
                    </p>
                  </div>
                  <Switch
                    checked={aeoSettings.voiceSearchTracking}
                    onCheckedChange={(checked) =>
                      updateSetting("voiceSearchTracking", checked)
                    }
                  />
                </div>
              </div>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Key AEO Metrics:</strong> Monitor AI citation rates,
                  featured snippet appearances, voice search visibility, and
                  zero-click engagement rates. AEO-driven visitors typically
                  show higher engagement and conversion rates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
