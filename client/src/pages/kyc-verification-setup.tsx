import { useState } from "react";
import { SEOHeadTags, SEOBreadcrumbs } from "@/components/SEOHeadTags";
import {
  adminPageSEO,
  generatePageTitle,
  generateAdminBreadcrumbs,
} from "@/lib/seo-utils";
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
  Shield,
  FileText,
  CreditCard,
  UserCheck,
  Camera,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Upload,
  Download,
  Settings,
  Lock,
  Users,
  Smartphone,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCLevel {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  limits: {
    daily: number;
    monthly: number;
    withdrawal: number;
  };
  documents: string[];
  approvalTime: string;
  isEnabled: boolean;
}

interface KYCSettings {
  enableKyc: boolean;
  autoApproval: boolean;
  requireForWithdraw: boolean;
  requireForDeposit: boolean;
  requireForSubscription: boolean;
  requireForTips: boolean;
  documentExpiry: number; // days
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  verificationTimeout: number; // hours
  maxVerificationAttempts: number;
  enableLiveness: boolean;
  enableAddressVerification: boolean;
  enableIncomeVerification: boolean;
  complianceLevel: "basic" | "standard" | "enhanced";
  riskAssessment: boolean;
  sanctions_screening: boolean;
  pep_screening: boolean; // Politically Exposed Persons
}

interface KYCTemplate {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    id: string;
    name: string;
    type: "text" | "email" | "phone" | "date" | "select" | "file" | "address";
    required: boolean;
    options?: string[];
    validation?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: "identity" | "address" | "income" | "business";
    required: boolean;
    description: string;
  }>;
}

export default function KYCVerificationSetup() {
  const seoData = adminPageSEO.kycVerificationSetup;
  const breadcrumbs = generateAdminBreadcrumbs("kyc-verification-setup");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [kycSettings, setKycSettings] = useState<KYCSettings>({
    enableKyc: true,
    autoApproval: false,
    requireForWithdraw: true,
    requireForDeposit: false,
    requireForSubscription: false,
    requireForTips: false,
    documentExpiry: 365,
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "pdf"],
    verificationTimeout: 72,
    maxVerificationAttempts: 3,
    enableLiveness: true,
    enableAddressVerification: true,
    enableIncomeVerification: false,
    complianceLevel: "standard",
    riskAssessment: true,
    sanctions_screening: true,
    pep_screening: false,
  });

  const [kycLevels] = useState<KYCLevel[]>([
    {
      id: "basic",
      name: "Basic Verification",
      description: "Email and phone verification for basic platform access",
      requirements: ["Email Address", "Phone Number", "Date of Birth"],
      limits: {
        daily: 100,
        monthly: 1000,
        withdrawal: 500,
      },
      documents: [],
      approvalTime: "Instant",
      isEnabled: true,
    },
    {
      id: "standard",
      name: "Standard Verification",
      description: "Government ID verification for increased limits",
      requirements: ["Government ID", "Selfie Photo", "Address Information"],
      limits: {
        daily: 2500,
        monthly: 25000,
        withdrawal: 5000,
      },
      documents: ["Government ID", "Proof of Address"],
      approvalTime: "24-48 hours",
      isEnabled: true,
    },
    {
      id: "enhanced",
      name: "Enhanced Verification",
      description:
        "Full documentation for business accounts and high-value transactions",
      requirements: [
        "All Standard Requirements",
        "Proof of Income",
        "Business Registration (if applicable)",
      ],
      limits: {
        daily: 10000,
        monthly: 100000,
        withdrawal: 25000,
      },
      documents: [
        "Government ID",
        "Proof of Address",
        "Proof of Income",
        "Business Documents",
      ],
      approvalTime: "3-5 business days",
      isEnabled: false,
    },
  ]);

  const [kycTemplates] = useState<KYCTemplate[]>([
    {
      id: "individual",
      name: "Individual Account",
      description: "Standard KYC form for individual users",
      fields: [
        { id: "firstName", name: "First Name", type: "text", required: true },
        { id: "lastName", name: "Last Name", type: "text", required: true },
        { id: "email", name: "Email Address", type: "email", required: true },
        { id: "phone", name: "Phone Number", type: "phone", required: true },
        {
          id: "dateOfBirth",
          name: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          id: "nationality",
          name: "Nationality",
          type: "select",
          required: true,
          options: ["US", "UK", "CA", "AU", "DE", "FR"],
        },
        { id: "address", name: "Address", type: "address", required: true },
        { id: "occupation", name: "Occupation", type: "text", required: false },
        {
          id: "sourceOfFunds",
          name: "Source of Funds",
          type: "select",
          required: true,
          options: ["Salary", "Business", "Investment", "Other"],
        },
      ],
      documents: [
        {
          id: "governmentId",
          name: "Government ID",
          type: "identity",
          required: true,
          description: "Passport, Driver License, or National ID",
        },
        {
          id: "proofOfAddress",
          name: "Proof of Address",
          type: "address",
          required: true,
          description: "Utility bill or bank statement (last 3 months)",
        },
        {
          id: "selfie",
          name: "Selfie Photo",
          type: "identity",
          required: true,
          description: "Clear photo of yourself holding your ID",
        },
      ],
    },
    {
      id: "business",
      name: "Business Account",
      description: "Enhanced KYC form for business accounts",
      fields: [
        {
          id: "companyName",
          name: "Company Name",
          type: "text",
          required: true,
        },
        {
          id: "registrationNumber",
          name: "Registration Number",
          type: "text",
          required: true,
        },
        {
          id: "businessType",
          name: "Business Type",
          type: "select",
          required: true,
          options: ["Corporation", "LLC", "Partnership", "Sole Proprietorship"],
        },
        {
          id: "incorporationDate",
          name: "Incorporation Date",
          type: "date",
          required: true,
        },
        {
          id: "businessAddress",
          name: "Business Address",
          type: "address",
          required: true,
        },
        {
          id: "website",
          name: "Company Website",
          type: "text",
          required: false,
        },
        {
          id: "annualRevenue",
          name: "Annual Revenue",
          type: "select",
          required: true,
          options: ["<$100K", "$100K-$1M", "$1M-$10M", ">$10M"],
        },
      ],
      documents: [
        {
          id: "businessRegistration",
          name: "Business Registration",
          type: "business",
          required: true,
          description: "Certificate of incorporation or registration",
        },
        {
          id: "businessLicense",
          name: "Business License",
          type: "business",
          required: true,
          description: "Valid business license or permit",
        },
        {
          id: "taxCertificate",
          name: "Tax Certificate",
          type: "business",
          required: true,
          description: "Tax registration certificate",
        },
        {
          id: "bankStatement",
          name: "Bank Statement",
          type: "business",
          required: true,
          description: "Business bank statement (last 3 months)",
        },
      ],
    },
  ]);

  const [complianceStats] = useState({
    totalSubmissions: 2847,
    pendingReview: 23,
    approved: 2654,
    rejected: 170,
    avgProcessingTime: "18 hours",
    complianceRate: 93.2,
  });

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Settings Saved",
        description: "KYC verification settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save KYC settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof KYCSettings, value: any) => {
    setKycSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getComplianceLevelBadge = (level: string) => {
    switch (level) {
      case "basic":
        return <Badge variant="secondary">Basic</Badge>;
      case "standard":
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      case "enhanced":
        return (
          <Badge className="bg-purple-100 text-purple-800">Enhanced</Badge>
        );
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const LevelCard = ({ level }: { level: KYCLevel }) => (
    <Card
      className={`hover:shadow-lg transition-all duration-300 ${!level.isEnabled ? "opacity-60" : ""}`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{level.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {level.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getComplianceLevelBadge(level.id)}
              <Badge variant={level.isEnabled ? "default" : "secondary"}>
                {level.isEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Requirements</h4>
              <ul className="text-xs space-y-1">
                {level.requirements.map((req, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Daily Limit</div>
                <div className="font-semibold">
                  ${level.limits.daily.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Monthly Limit</div>
                <div className="font-semibold">
                  ${level.limits.monthly.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Withdrawal Limit</div>
                <div className="font-semibold">
                  ${level.limits.withdrawal.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Approval Time</div>
                <div className="font-semibold">{level.approvalTime}</div>
              </div>
            </div>

            {level.documents.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Required Documents</h4>
                <div className="flex flex-wrap gap-1">
                  {level.documents.map((doc, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TemplateCard = ({ template }: { template: KYCTemplate }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">
                Form Fields ({template.fields.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {template.fields.slice(0, 6).map((field) => (
                  <Badge key={field.id} variant="secondary" className="text-xs">
                    {field.name}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Badge>
                ))}
                {template.fields.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.fields.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">
                Documents ({template.documents.length})
              </h4>
              <div className="space-y-1">
                {template.documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span>{doc.name}</span>
                    {doc.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
                {template.documents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{template.documents.length - 3} more documents
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHeadTags
        title={generatePageTitle(seoData.title)}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://fanzdash.com/kyc-verification-setup"
        schema={seoData.structuredData}
      />

      <div className="space-y-6">
        <SEOBreadcrumbs items={breadcrumbs} className="mb-6" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <span>KYC Verification Setup</span>
            </h1>
            <p className="text-muted-foreground">
              Configure know-your-customer verification requirements and
              compliance settings
            </p>
          </div>

          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="levels">Verification Levels</TabsTrigger>
            <TabsTrigger value="templates">Forms & Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceStats.totalSubmissions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Submissions
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceStats.pendingReview}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pending Review
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceStats.approved}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {complianceStats.complianceRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Compliance Rate
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Status & Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>KYC Enabled</span>
                      <Badge
                        variant={
                          kycSettings.enableKyc ? "default" : "secondary"
                        }
                      >
                        {kycSettings.enableKyc ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {kycSettings.enableKyc ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto Approval</span>
                      <Badge
                        variant={
                          kycSettings.autoApproval ? "default" : "outline"
                        }
                      >
                        {kycSettings.autoApproval ? "Enabled" : "Manual Review"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Compliance Level</span>
                      {getComplianceLevelBadge(kycSettings.complianceLevel)}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Required for Withdrawal</span>
                      <Badge
                        variant={
                          kycSettings.requireForWithdraw ? "default" : "outline"
                        }
                      >
                        {kycSettings.requireForWithdraw
                          ? "Required"
                          : "Optional"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Liveness Detection</span>
                      <Badge
                        variant={
                          kycSettings.enableLiveness ? "default" : "secondary"
                        }
                      >
                        {kycSettings.enableLiveness ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Processing Time</span>
                      <Badge variant="outline">
                        {complianceStats.avgProcessingTime}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Compliance Notice:</strong> KYC verification is
                    required by law for financial services. Ensure your settings
                    comply with local regulations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Levels Tab */}
          <TabsContent value="levels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kycLevels.map((level) => (
                <LevelCard key={level.id} level={level} />
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kycTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-kyc">
                        Enable KYC Verification
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require identity verification for platform access
                      </p>
                    </div>
                    <Switch
                      id="enable-kyc"
                      checked={kycSettings.enableKyc}
                      onCheckedChange={(checked) =>
                        updateSetting("enableKyc", checked)
                      }
                      data-testid="enable-kyc-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-approval">Auto Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve low-risk submissions
                      </p>
                    </div>
                    <Switch
                      id="auto-approval"
                      checked={kycSettings.autoApproval}
                      onCheckedChange={(checked) =>
                        updateSetting("autoApproval", checked)
                      }
                      disabled={!kycSettings.enableKyc}
                      data-testid="auto-approval-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-withdraw">
                        Required for Withdrawals
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require KYC before allowing withdrawals
                      </p>
                    </div>
                    <Switch
                      id="require-withdraw"
                      checked={kycSettings.requireForWithdraw}
                      onCheckedChange={(checked) =>
                        updateSetting("requireForWithdraw", checked)
                      }
                      disabled={!kycSettings.enableKyc}
                      data-testid="require-withdraw-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-subscription">
                        Required for Subscriptions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Require KYC before subscribing to creators
                      </p>
                    </div>
                    <Switch
                      id="require-subscription"
                      checked={kycSettings.requireForSubscription}
                      onCheckedChange={(checked) =>
                        updateSetting("requireForSubscription", checked)
                      }
                      disabled={!kycSettings.enableKyc}
                      data-testid="require-subscription-toggle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compliance-level">Compliance Level</Label>
                    <Select
                      value={kycSettings.complianceLevel}
                      onValueChange={(value: any) =>
                        updateSetting("complianceLevel", value)
                      }
                    >
                      <SelectTrigger data-testid="compliance-level-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">
                          Basic - Email & Phone
                        </SelectItem>
                        <SelectItem value="standard">
                          Standard - ID Verification
                        </SelectItem>
                        <SelectItem value="enhanced">
                          Enhanced - Full Documentation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">
                      Max Verification Attempts
                    </Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={kycSettings.maxVerificationAttempts}
                      onChange={(e) =>
                        updateSetting(
                          "maxVerificationAttempts",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="max-attempts-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-timeout">
                      Verification Timeout (hours)
                    </Label>
                    <Input
                      id="verification-timeout"
                      type="number"
                      min="1"
                      max="168"
                      value={kycSettings.verificationTimeout}
                      onChange={(e) =>
                        updateSetting(
                          "verificationTimeout",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="verification-timeout-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document-expiry">
                      Document Validity (days)
                    </Label>
                    <Input
                      id="document-expiry"
                      type="number"
                      min="30"
                      max="3650"
                      value={kycSettings.documentExpiry}
                      onChange={(e) =>
                        updateSetting(
                          "documentExpiry",
                          parseInt(e.target.value),
                        )
                      }
                      data-testid="document-expiry-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-liveness">Liveness Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify selfies are taken by live persons
                    </p>
                  </div>
                  <Switch
                    id="enable-liveness"
                    checked={kycSettings.enableLiveness}
                    onCheckedChange={(checked) =>
                      updateSetting("enableLiveness", checked)
                    }
                    data-testid="enable-liveness-toggle"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="risk-assessment">Risk Assessment</Label>
                    <p className="text-sm text-muted-foreground">
                      Perform automated risk scoring
                    </p>
                  </div>
                  <Switch
                    id="risk-assessment"
                    checked={kycSettings.riskAssessment}
                    onCheckedChange={(checked) =>
                      updateSetting("riskAssessment", checked)
                    }
                    data-testid="risk-assessment-toggle"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sanctions-screening">
                      Sanctions Screening
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Check against international sanctions lists
                    </p>
                  </div>
                  <Switch
                    id="sanctions-screening"
                    checked={kycSettings.sanctions_screening}
                    onCheckedChange={(checked) =>
                      updateSetting("sanctions_screening", checked)
                    }
                    data-testid="sanctions-screening-toggle"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pep-screening">PEP Screening</Label>
                    <p className="text-sm text-muted-foreground">
                      Screen for Politically Exposed Persons
                    </p>
                  </div>
                  <Switch
                    id="pep-screening"
                    checked={kycSettings.pep_screening}
                    onCheckedChange={(checked) =>
                      updateSetting("pep_screening", checked)
                    }
                    data-testid="pep-screening-toggle"
                  />
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Advanced security features may require additional API
                    integrations and may increase verification processing time.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">
                      Supported Regulations
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          AML (Anti-Money Laundering)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          KYC (Know Your Customer)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">GDPR Compliance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">PCI DSS Standards</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">SOX Compliance</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Data Protection</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">End-to-end encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Secure document storage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Audit trail logging</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Data retention policies</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Access control</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Compliance Warning:</strong> Ensure your KYC
                    settings comply with regulations in your jurisdiction.
                    Consult with legal experts for specific requirements.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit & Reporting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Compliance Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Audit Log</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>User Status Report</span>
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Reports include verification statistics, compliance metrics,
                  and audit trails for regulatory review.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
