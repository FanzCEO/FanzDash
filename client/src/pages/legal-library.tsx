import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Scale,
  Shield,
  FileText,
  Users,
  Database,
  AlertTriangle,
  BookOpen,
  Lock,
  Gavel,
  Globe,
  Download,
  Eye,
  Clock
} from "lucide-react";

export default function LegalLibrary() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold cyber-text-glow">Legal Library</h1>
              <p className="text-lg text-gray-400">Fanz™ Unlimited Network LLC</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Effective: 10/24/24</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Last Updated: 2/07/2025</span>
            </div>
            <Badge variant="outline" className="text-amber-400 border-amber-400">
              © 2025 Fanz™ Unlimited Network LLC
            </Badge>
          </div>

          <p className="text-gray-300 max-w-4xl mx-auto">
            Comprehensive legal framework ensuring full compliance with U.S., EU, and international laws, 
            providing detailed enforcement guidelines for administrators and users across the Fanz ecosystem.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-700">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="agreements" className="text-xs">User Agreements</TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs">Content Moderation</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">Data Retention</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">Admin Compliance</TabsTrigger>
            <TabsTrigger value="legal-refs" className="text-xs">Legal References</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-700 hover:border-amber-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-lg">User Agreements & Contracts</CardTitle>
                  </div>
                  <CardDescription>
                    Legally binding agreements and compliance tracking systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• FUN User Agreement (Wyoming Law)</li>
                    <li>• Electronic Signatures (E-SIGN Act)</li>
                    <li>• Mandatory Arbitration Clauses</li>
                    <li>• Admin Compliance Tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700 hover:border-red-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <CardTitle className="text-lg">Content Moderation & Enforcement</CardTitle>
                  </div>
                  <CardDescription>
                    Prohibited content policies and enforcement procedures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• CSAM Detection (18 U.S.C. § 2252A)</li>
                    <li>• DMCA Copyright Enforcement</li>
                    <li>• Human Trafficking Prevention</li>
                    <li>• Revenge Porn Protection</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-lg">Data Retention & Security</CardTitle>
                  </div>
                  <CardDescription>
                    GDPR, CCPA compliance and secure deletion protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• 7-Year Retention Policy</li>
                    <li>• DoD 5220.22-M Deletion</li>
                    <li>• Legal Hold Protocols</li>
                    <li>• NIST 800-88 Sanitization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-lg">Admin Training & Compliance</CardTitle>
                  </div>
                  <CardDescription>
                    Training resources and quick reference materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Admin Quick Reference Sheet</li>
                    <li>• PowerPoint Training Outlines</li>
                    <li>• Violation Escalation Matrix</li>
                    <li>• Compliance Deadlines</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <CardTitle className="text-lg">U.S. Legal Compliance</CardTitle>
                  </div>
                  <CardDescription>
                    Federal and state law requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• DMCA (17 U.S.C. § 512)</li>
                    <li>• CCPA Data Protection</li>
                    <li>• COPA Child Protection</li>
                    <li>• Wyoming Contract Law</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Gavel className="w-5 h-5 text-orange-400" />
                    <CardTitle className="text-lg">International Compliance</CardTitle>
                  </div>
                  <CardDescription>
                    EU and international law requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• GDPR (Article 17)</li>
                    <li>• EU Digital Services Act</li>
                    <li>• Berne Convention</li>
                    <li>• ISO 27001 Security</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Emergency Compliance Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                    onClick={() => setLocation('/content-moderation-hub')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    CSAM Report
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                    onClick={() => setLocation('/content-moderation-hub')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    DMCA Takedown
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    onClick={() => setLocation('/legal-hold-management')}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Legal Hold
                  </Button>
                  <Button
                    variant="outline"
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => setLocation('/crisis-management')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Crisis Escalation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Agreements Tab */}
          <TabsContent value="agreements" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-blue-400" />
                  <span>Fanz™ Unlimited Network User Agreement</span>
                </CardTitle>
                <CardDescription>
                  Legally binding contract governed by Wyoming state law and federal regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-cyan-400">Legal Basis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <Badge variant="outline" className="text-xs mt-0.5">Wyoming</Badge>
                        <span>Contract Law of the State of Wyoming, United States</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Badge variant="outline" className="text-xs mt-0.5">Federal</Badge>
                        <span>Electronic Signatures in Global and National Commerce Act (E-SIGN Act)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Badge variant="outline" className="text-xs mt-0.5">UETA</Badge>
                        <span>Uniform Electronic Transactions Act</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Badge variant="outline" className="text-xs mt-0.5">GDPR</Badge>
                        <span>Article 6(1)(b) - Contract necessity for data processing</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-amber-400">Platform Coverage</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Fanz Collection of Content Starz Platformz:</span>
                        <p className="text-xs mt-1 text-gray-500">
                          BoyFanz.com, GirlFanz.com, DaddiesFanz.com, TransFanz.com, EbonyFanz.com, 
                          PupFanz.com, DLBroz.com, SouthernFanz.com, KinkFanz.com, FanzUnlimited.com, 
                          AllMyFanz.com, BoysRebellion.com, DaddiesToyBoy.com, DLRedneck.com, 
                          RecoveryFanz.com, WildRedneckRebel.com
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Fanz Collection of Auxiliary Sites:</span>
                        <p className="text-xs mt-1 text-gray-500">
                          Fanz.Ceo, Fanz.Community, Fanz.Fans, Fanz.Fan, Fanz.Foundation, 
                          Fanz.Solutions, Fanz.ing, Fanz.University, Fanz.Follow, Fanz.Toys, FMD.Solutions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-red-400">Dispute Resolution & Arbitration</h4>
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong>Mandatory Arbitration Clause:</strong> Users waive their right to sue in public court 
                          and must resolve disputes via arbitration in Sheridan, Wyoming, USA.
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong>Class Action Waiver:</strong> Users cannot file class-action lawsuits against FUN.
                          <br />
                          <span className="text-xs text-gray-400">
                            (AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011))
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Escalation Matrix */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle>Admin Escalation Process</CardTitle>
                <CardDescription>Violation severity and required actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 text-gray-400">Severity</th>
                        <th className="text-left p-3 text-gray-400">Action Required</th>
                        <th className="text-left p-3 text-gray-400">Escalation Level</th>
                        <th className="text-left p-3 text-gray-400">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">Minor</Badge>
                          <br />
                          <span className="text-xs text-gray-500">Spam, Harassment</span>
                        </td>
                        <td className="p-3">Warning issued</td>
                        <td className="p-3">Admin Review</td>
                        <td className="p-3 text-xs text-gray-400">24-48 hours</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">
                          <Badge variant="outline" className="text-orange-400 border-orange-400">Major</Badge>
                          <br />
                          <span className="text-xs text-gray-500">Fraud, Hate Speech</span>
                        </td>
                        <td className="p-3">Content removal, suspension</td>
                        <td className="p-3">Senior Admin Review</td>
                        <td className="p-3 text-xs text-gray-400">4-24 hours</td>
                      </tr>
                      <tr>
                        <td className="p-3">
                          <Badge variant="outline" className="text-red-400 border-red-400">Severe</Badge>
                          <br />
                          <span className="text-xs text-gray-500">CSAM, Human Trafficking</span>
                        </td>
                        <td className="p-3">Permanent ban, law enforcement referral</td>
                        <td className="p-3">Legal Department</td>
                        <td className="p-3 text-xs text-gray-400">Immediate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-red-900/20 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">Prohibited Content Categories</CardTitle>
                  <CardDescription>
                    Strictly prohibited content with legal references
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-900/30 rounded border border-red-500/50">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong className="text-red-400">Child Sexual Abuse Material (CSAM)</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Violation of 18 U.S.C. § 2252A (Federal Law)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-red-900/30 rounded border border-red-500/50">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong className="text-red-400">Bestiality</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Violation of U.S. Animal Crush Video Prohibition Act, 18 U.S.C. § 48
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-red-900/30 rounded border border-red-500/50">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong className="text-red-400">Revenge Porn / Non-Consensual Intimate Media</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Violation of 47 U.S.C. § 230 (SAFE SEX Act)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-red-900/30 rounded border border-red-500/50">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <strong className="text-red-400">Human Trafficking / Exploitation</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Violation of Trafficking Victims Protection Act (TVPA), 22 U.S.C. § 7102
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400">DMCA Copyright Enforcement</CardTitle>
                  <CardDescription>
                    Digital Millennium Copyright Act compliance procedures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-sm text-blue-400 mb-2">Legal Basis</h5>
                      <ul className="text-xs space-y-1 text-gray-300">
                        <li>• Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512</li>
                        <li>• Berne Convention for the Protection of Literary and Artistic Works</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm text-blue-400 mb-2">Takedown Process</h5>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Badge variant="outline" className="text-xs mt-0.5">1</Badge>
                          <div className="text-xs">
                            <strong>Receipt of Complaint</strong> - Must include signature, copyrighted work 
                            identification, location of infringing material, and legal statement of good faith.
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Badge variant="outline" className="text-xs mt-0.5">2</Badge>
                          <div className="text-xs">
                            <strong>Content Removal</strong> - Admins must disable access within 24 hours 
                            of a valid claim.
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Badge variant="outline" className="text-xs mt-0.5">3</Badge>
                          <div className="text-xs">
                            <strong>User Notification</strong> - Users have 10 days to respond before 
                            content is permanently removed.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-green-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">Data Retention Periods</CardTitle>
                  <CardDescription>Legal requirements for data storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-green-500/30">
                          <th className="text-left p-2 text-green-400 text-sm">Data Type</th>
                          <th className="text-left p-2 text-green-400 text-sm">Retention</th>
                          <th className="text-left p-2 text-green-400 text-sm">Legal Reference</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-gray-800">
                          <td className="p-2">User Agreements</td>
                          <td className="p-2">5 years after termination</td>
                          <td className="p-2 text-gray-400">GDPR, CCPA</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="p-2">Billing Records</td>
                          <td className="p-2">7 years</td>
                          <td className="p-2 text-gray-400">IRS Tax Compliance</td>
                        </tr>
                        <tr>
                          <td className="p-2">Removed Content (Forensic Records)</td>
                          <td className="p-2">10 years</td>
                          <td className="p-2 text-gray-400">Law Enforcement Requirement</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">Secure Deletion Protocols</CardTitle>
                  <CardDescription>Military-grade data sanitization standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-sm text-purple-400 mb-2">Deletion Standards</h5>
                      <div className="space-y-2">
                        <div className="p-2 bg-purple-900/30 rounded border border-purple-500/50">
                          <strong className="text-sm">DoD 5220.22-M Standard</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Department of Defense standard for digital erasure of regular content
                          </p>
                        </div>
                        <div className="p-2 bg-purple-900/30 rounded border border-purple-500/50">
                          <strong className="text-sm">NIST 800-88 Guidelines</strong>
                          <p className="text-xs text-gray-400 mt-1">
                            Advanced sanitization for forensic deletions and sensitive data
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm text-purple-400 mb-2">Legal Hold Protocol</h5>
                      <div className="text-xs space-y-1 text-gray-300">
                        <li>• Legal Holds Prevent Data Deletion During Investigations</li>
                        <li>• Only the Legal Team Can Remove a Hold</li>
                        <li>• All hold actions are logged and audited</li>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle>Admin Quick Reference Sheet</CardTitle>
                <CardDescription>Essential compliance deadlines and responsible departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 text-gray-400">Task</th>
                        <th className="text-left p-3 text-gray-400">Deadline</th>
                        <th className="text-left p-3 text-gray-400">Responsible Department</th>
                        <th className="text-left p-3 text-gray-400">Compliance Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">DMCA Complaint Processing</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-red-400 border-red-400">24 Hours</Badge>
                        </td>
                        <td className="p-3">Legal Team</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-amber-400 border-amber-400">LEGAL_TEAM</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">User Suspension for Violations</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-red-400 border-red-400">Immediately</Badge>
                        </td>
                        <td className="p-3">Moderation Team</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">MODERATOR</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">CSAM Content Reporting</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-red-400 border-red-400">Immediately</Badge>
                        </td>
                        <td className="p-3">Security + Legal</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-red-400 border-red-400">CRISIS_MANAGER</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Retention Review</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-green-400 border-green-400">Annually</Badge>
                        </td>
                        <td className="p-3">Data Compliance Team</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-green-400 border-green-400">COMPLIANCE_OFFICER</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle>Training Resources</CardTitle>
                <CardDescription>Admin training materials and compliance education</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-lg mb-3 text-cyan-400">PowerPoint Training Outline</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Legal responsibilities of FUN administrators</li>
                      <li>• How to handle user disputes and legal notices</li>
                      <li>• Content moderation and law enforcement cooperation</li>
                      <li>• GDPR and CCPA compliance procedures</li>
                      <li>• Crisis management and escalation protocols</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-lg mb-3 text-amber-400">Required Compliance Logs</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• User Agreement Compliance Log</li>
                      <li>• Complaint Resolution Log</li>
                      <li>• DMCA Compliance Log</li>
                      <li>• Data Retention Audit Log</li>
                      <li>• Legal Hold Management Log</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal References Tab */}
          <TabsContent value="legal-refs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400">U.S. Laws & Regulations</CardTitle>
                  <CardDescription>Federal and state legal requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border border-blue-500/30 rounded">
                      <strong>Digital Millennium Copyright Act (DMCA)</strong>
                      <p className="text-xs text-gray-400 mt-1">17 U.S.C. § 512 - Safe harbor provisions for online platforms</p>
                    </div>
                    <div className="p-3 border border-blue-500/30 rounded">
                      <strong>California Consumer Privacy Act (CCPA)</strong>
                      <p className="text-xs text-gray-400 mt-1">Section 1798.105 - Consumer rights for data deletion</p>
                    </div>
                    <div className="p-3 border border-blue-500/30 rounded">
                      <strong>Child Online Protection Act (COPA)</strong>
                      <p className="text-xs text-gray-400 mt-1">47 U.S.C. § 231 - Protection of minors online</p>
                    </div>
                    <div className="p-3 border border-blue-500/30 rounded">
                      <strong>18 U.S.C. § 2257</strong>
                      <p className="text-xs text-gray-400 mt-1">Record-keeping requirements for adult content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">European Union Laws</CardTitle>
                  <CardDescription>EU regulations and directives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border border-purple-500/30 rounded">
                      <strong>General Data Protection Regulation (GDPR)</strong>
                      <p className="text-xs text-gray-400 mt-1">Article 17 - Right to Erasure ("Right to be Forgotten")</p>
                    </div>
                    <div className="p-3 border border-purple-500/30 rounded">
                      <strong>EU Digital Services Act (DSA)</strong>
                      <p className="text-xs text-gray-400 mt-1">2022/2065 - Content moderation and platform liability</p>
                    </div>
                    <div className="p-3 border border-purple-500/30 rounded">
                      <strong>ePrivacy Directive</strong>
                      <p className="text-xs text-gray-400 mt-1">2002/58/EC - Electronic communications privacy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">International Treaties</CardTitle>
                  <CardDescription>Global copyright and data protection agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border border-green-500/30 rounded">
                      <strong>Berne Convention</strong>
                      <p className="text-xs text-gray-400 mt-1">Protection of Literary and Artistic Works</p>
                    </div>
                    <div className="p-3 border border-green-500/30 rounded">
                      <strong>ISO 27001</strong>
                      <p className="text-xs text-gray-400 mt-1">Information Security Management Standard</p>
                    </div>
                    <div className="p-3 border border-green-500/30 rounded">
                      <strong>WIPO Copyright Treaty</strong>
                      <p className="text-xs text-gray-400 mt-1">World Intellectual Property Organization standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-900/20 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-400">Case Law References</CardTitle>
                  <CardDescription>Relevant legal precedents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border border-orange-500/30 rounded">
                      <strong>AT&T Mobility LLC v. Concepcion</strong>
                      <p className="text-xs text-gray-400 mt-1">563 U.S. 333 (2011) - Class action waiver enforceability</p>
                    </div>
                    <div className="p-3 border border-orange-500/30 rounded">
                      <strong>Specht v. Netscape Communications</strong>
                      <p className="text-xs text-gray-400 mt-1">306 F.3d 17 (2d Cir. 2002) - Clickwrap agreement validity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-800">
          <p>
            This Legal & Compliance Library ensures Fanz™ Unlimited Network is fully aligned with all major 
            legal requirements for digital platforms, copyright enforcement, and user data security.
          </p>
          <p className="mt-2">
            For legal questions or compliance issues, contact the Legal Department immediately.
          </p>
        </div>
      </div>
    </div>
  );
}