import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
} from "lucide-react";

interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  agreeTerms: boolean;
}

interface ContactPageProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  settings: {
    linkTerms?: string;
    linkPrivacy?: string;
    captchaEnabled: boolean;
    contactInfo?: {
      address?: string;
      phone?: string;
      email?: string;
      hours?: string;
    };
  };
  user?: {
    name: string;
    email: string;
  };
  className?: string;
}

export function ContactPage({
  onSubmit,
  settings,
  user,
  className = "",
}: ContactPageProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    if (settings.linkTerms && settings.linkPrivacy && !formData.agreeTerms) {
      newErrors.agreeTerms = true as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await onSubmit(formData);
      setSubmitStatus("success");
      setSubmitMessage(
        "Thank you for your message! We'll get back to you soon.",
      );

      // Reset form
      setFormData({
        fullName: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
        agreeTerms: false,
      });
    } catch (error: any) {
      setSubmitStatus("error");
      setSubmitMessage(
        error.message || "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-500/5 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Mail className="h-10 w-10 text-primary" />
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or need support? We're here to help and would love
              to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <Card className="h-fit bg-card/50 backdrop-blur-sm border-2 border-muted/20">
                <CardHeader>
                  <h3 className="text-xl font-bold">Get in Touch</h3>
                  <p className="text-muted-foreground">
                    Reach out to us through any of these channels
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings.contactInfo?.email && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Email</h4>
                        <p className="text-muted-foreground">
                          {settings.contactInfo.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.contactInfo?.phone && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Phone</h4>
                        <p className="text-muted-foreground">
                          {settings.contactInfo.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.contactInfo?.address && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Address</h4>
                        <p className="text-muted-foreground">
                          {settings.contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.contactInfo?.hours && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Hours</h4>
                        <p className="text-muted-foreground">
                          {settings.contactInfo.hours}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Response Time</h4>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-2 border-muted/20">
                <CardHeader>
                  <h3 className="text-2xl font-bold">Send us a Message</h3>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Status Messages */}
                  {submitStatus === "success" && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {submitMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === "error" && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{submitMessage}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className={errors.fullName ? "border-red-500" : ""}
                          data-testid="contact-fullname-input"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-red-600">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center space-x-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Email Address</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Enter your email address"
                          className={errors.email ? "border-red-500" : ""}
                          data-testid="contact-email-input"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="subject"
                        className="flex items-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Subject</span>
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder="What's this about?"
                        className={errors.subject ? "border-red-500" : ""}
                        data-testid="contact-subject-input"
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className={errors.message ? "border-red-500" : ""}
                        data-testid="contact-message-input"
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600">{errors.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formData.message.length} characters (minimum 10
                        required)
                      </p>
                    </div>

                    {/* Terms Agreement */}
                    {settings.linkTerms && settings.linkPrivacy && (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) =>
                              handleInputChange("agreeTerms", checked === true)
                            }
                            className={
                              errors.agreeTerms ? "border-red-500" : ""
                            }
                            data-testid="contact-terms-checkbox"
                          />
                          <Label
                            htmlFor="agreeTerms"
                            className="text-sm leading-relaxed"
                          >
                            I agree to the{" "}
                            <a
                              href={settings.linkTerms}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Terms & Conditions
                            </a>{" "}
                            and{" "}
                            <a
                              href={settings.linkPrivacy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        {errors.agreeTerms && (
                          <p className="text-sm text-red-600">
                            {errors.agreeTerms}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      data-testid="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    {/* Captcha Notice */}
                    {settings.captchaEnabled && (
                      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>This site is protected by reCAPTCHA</span>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
