import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Filter,
  Star,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  FileText,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  status: "active" | "on_leave" | "terminated" | "pending";
  hireDate: string;
  terminationDate?: string;
  salary: number;
  payFrequency: "hourly" | "weekly" | "biweekly" | "monthly" | "annual";
  manager?: string;
  location: string;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  reviewDate: string;
  overallRating: number;
  categories: {
    name: string;
    rating: number;
    comments: string;
  }[];
  strengths: string;
  areasForImprovement: string;
  goals: string;
  status: "draft" | "completed" | "acknowledged";
  nextReviewDate?: string;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  deductions: {
    taxes: number;
    benefits: number;
    retirement: number;
    other: number;
  };
  netPay: number;
  status: "pending" | "processed" | "paid" | "failed";
  paymentDate?: string;
  paymentMethod: "direct_deposit" | "check" | "wire_transfer";
}

interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment: string;
  employeeCount: number;
  budget: number;
}

interface Benefit {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitType: "health" | "dental" | "vision" | "life" | "disability" | "401k" | "pto" | "other";
  provider: string;
  planName: string;
  enrollmentDate: string;
  coverage: "employee" | "employee_spouse" | "employee_children" | "family";
  employeeContribution: number;
  employerContribution: number;
  status: "active" | "pending" | "terminated";
}

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  capacity: number;
  enrolled: number;
  status: "upcoming" | "in_progress" | "completed";
  cost: number;
}

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function HRManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPerformanceReview, setShowPerformanceReview] = useState(false);

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/hr/employees", selectedDepartment],
    refetchInterval: 30000,
  });

  // Fetch performance reviews
  const { data: reviews = [] } = useQuery<PerformanceReview[]>({
    queryKey: ["/api/hr/performance-reviews"],
    refetchInterval: 30000,
  });

  // Fetch payroll records
  const { data: payrollRecords = [] } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/hr/payroll"],
    refetchInterval: 60000,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/hr/departments"],
  });

  // Fetch benefits
  const { data: benefits = [] } = useQuery<Benefit[]>({
    queryKey: ["/api/hr/benefits"],
    refetchInterval: 30000,
  });

  // Fetch training programs
  const { data: trainingPrograms = [] } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/hr/training"],
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (data: Partial<Employee>) => apiRequest("/api/hr/employees", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "Employee added successfully" });
      setShowAddEmployee(false);
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      apiRequest(`/api/hr/employees/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "Employee updated successfully" });
      setSelectedEmployee(null);
    },
  });

  // Terminate employee mutation
  const terminateEmployeeMutation = useMutation({
    mutationFn: ({ id, terminationDate, reason }: { id: string; terminationDate: string; reason: string }) =>
      apiRequest(`/api/hr/employees/${id}/terminate`, "POST", { terminationDate, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "Employee terminated" });
    },
  });

  // Create performance review mutation
  const createReviewMutation = useMutation({
    mutationFn: (data: Partial<PerformanceReview>) =>
      apiRequest("/api/hr/performance-reviews", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/performance-reviews"] });
      toast({ title: "Performance review created" });
      setShowPerformanceReview(false);
    },
  });

  // Process payroll mutation
  const processPayrollMutation = useMutation({
    mutationFn: (payrollIds: string[]) =>
      apiRequest("/api/hr/payroll/process", "POST", { payrollIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll"] });
      toast({ title: "Payroll processed successfully" });
    },
  });

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDepartment === "all" || emp.department === selectedDepartment;
    const matchesSearch =
      searchQuery === "" ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Stats calculations
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const pendingReviews = reviews.filter((r) => r.status === "draft").length;
  const totalPayroll = payrollRecords
    .filter((p) => p.status === "processed" || p.status === "paid")
    .reduce((sum, p) => sum + p.netPay, 0);
  const activeBenefits = benefits.filter((b) => b.status === "active").length;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "terminated":
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "on_leave":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Export to CSV
  const handleExportCSV = (type: "employees" | "payroll" | "reviews") => {
    let csv = "";
    let filename = "";

    if (type === "employees") {
      csv = "First Name,Last Name,Email,Phone,Department,Position,Status,Hire Date,Salary\n";
      employees.forEach((emp) => {
        csv += `${emp.firstName},${emp.lastName},${emp.email},${emp.phone},${emp.department},${emp.position},${emp.status},${emp.hireDate},${emp.salary}\n`;
      });
      filename = "employees";
    } else if (type === "payroll") {
      csv = "Employee,Period Start,Period End,Gross Pay,Net Pay,Status,Payment Date\n";
      payrollRecords.forEach((rec) => {
        csv += `${rec.employeeName},${rec.payPeriodStart},${rec.payPeriodEnd},${rec.grossPay},${rec.netPay},${rec.status},${rec.paymentDate || "N/A"}\n`;
      });
      filename = "payroll";
    } else if (type === "reviews") {
      csv = "Employee,Reviewer,Review Date,Overall Rating,Status\n";
      reviews.forEach((rev) => {
        csv += `${rev.employeeName},${rev.reviewerName},${rev.reviewDate},${rev.overallRating},${rev.status}\n`;
      });
      filename = "performance_reviews";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: `${type} exported successfully` });
  };

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow">
              HR Management System
            </h1>
            <p className="text-gray-400 mt-2">
              Manage employees, performance, payroll, and benefits
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddEmployee(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Employees</p>
                <p className="text-2xl font-bold mt-1">{activeEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold mt-1">{pendingReviews}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Payroll</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalPayroll.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Benefits</p>
                <p className="text-2xl font-bold mt-1">{activeBenefits}</p>
              </div>
              <Heart className="h-8 w-8 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="cyber-input pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => handleExportCSV("employees")}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {/* Employee List */}
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="cyber-card p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {employee.position} • {employee.department} • {employee.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Hired: {new Date(employee.hireDate).toLocaleDateString()} •{" "}
                            {employee.employmentType.replace("_", " ")} •{" "}
                            ${employee.salary.toLocaleString()}/{employee.payFrequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No employees found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Performance Reviews</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("reviews")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => setShowPerformanceReview(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      New Review
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {review.overallRating}
                          </div>
                          <div>
                            <p className="font-semibold">{review.employeeName}</p>
                            <p className="text-sm text-gray-400">
                              Reviewed by {review.reviewerName} on{" "}
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">
                          <span className="font-semibold">Review Period:</span>{" "}
                          {review.reviewPeriod}
                        </p>
                        <p className="mb-2">
                          <span className="font-semibold">Strengths:</span> {review.strengths}
                        </p>
                        <p>
                          <span className="font-semibold">Areas for Improvement:</span>{" "}
                          {review.areasForImprovement}
                        </p>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center text-gray-400 py-8">
                      No performance reviews found
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Payroll Records</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV("payroll")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => {
                        const pendingIds = payrollRecords
                          .filter((p) => p.status === "pending")
                          .map((p) => p.id);
                        if (pendingIds.length > 0) {
                          processPayrollMutation.mutate(pendingIds);
                        } else {
                          toast({
                            title: "No pending payroll to process",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {payrollRecords.map((record) => (
                    <div key={record.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{record.employeeName}</p>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            Pay Period: {new Date(record.payPeriodStart).toLocaleDateString()} -{" "}
                            {new Date(record.payPeriodEnd).toLocaleDateString()}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Gross Pay</p>
                              <p className="font-semibold text-green-400">
                                ${record.grossPay.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Deductions</p>
                              <p className="font-semibold text-red-400">
                                $
                                {(
                                  record.deductions.taxes +
                                  record.deductions.benefits +
                                  record.deductions.retirement +
                                  record.deductions.other
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Net Pay</p>
                              <p className="font-semibold text-cyan-400">
                                ${record.netPay.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payment Method</p>
                              <p className="font-semibold">
                                {record.paymentMethod.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {payrollRecords.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No payroll records found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Employee Benefits</h3>
                  <Button className="bg-gradient-to-r from-red-500 to-pink-500">
                    <Heart className="h-4 w-4 mr-2" />
                    Add Benefit
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                        >
                          {benefit.benefitType}
                        </Badge>
                        <Badge className={getStatusColor(benefit.status)}>
                          {benefit.status}
                        </Badge>
                      </div>
                      <p className="font-semibold mb-1">{benefit.employeeName}</p>
                      <p className="text-sm text-gray-400 mb-2">{benefit.planName}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Provider: {benefit.provider}</p>
                        <p>Coverage: {benefit.coverage.replace(/_/g, " + ")}</p>
                        <p>
                          Employee: ${benefit.employeeContribution}/mo • Employer: $
                          {benefit.employerContribution}/mo
                        </p>
                        <p>
                          Enrolled: {new Date(benefit.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {benefits.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No benefits enrolled
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Training Programs</h3>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    New Program
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingPrograms.map((program) => (
                    <div key={program.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                        <p className="text-sm text-gray-400">${program.cost}</p>
                      </div>
                      <h4 className="font-semibold mb-2">{program.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{program.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Instructor: {program.instructor}</p>
                        <p>
                          Duration: {new Date(program.startDate).toLocaleDateString()} -{" "}
                          {new Date(program.endDate).toLocaleDateString()}
                        </p>
                        <p>
                          Enrollment: {program.enrolled}/{program.capacity}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Enroll Employees
                      </Button>
                    </div>
                  ))}
                  {trainingPrograms.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8">
                      No training programs available
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Departments</h3>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Briefcase className="h-6 w-6 text-cyan-400" />
                        <Badge variant="outline">{dept.employeeCount} employees</Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{dept.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{dept.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Head: {dept.headOfDepartment}</p>
                        <p>Budget: ${dept.budget.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {departments.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No departments configured
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
          <DialogContent className="cyber-card max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter employee information</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createEmployeeMutation.mutate({
                  firstName: formData.get("firstName") as string,
                  lastName: formData.get("lastName") as string,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string,
                  role: formData.get("role") as string,
                  department: formData.get("department") as string,
                  position: formData.get("position") as string,
                  employmentType: formData.get("employmentType") as any,
                  hireDate: formData.get("hireDate") as string,
                  salary: parseFloat(formData.get("salary") as string),
                  payFrequency: formData.get("payFrequency") as any,
                  location: formData.get("location") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input name="firstName" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input name="lastName" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input name="email" type="email" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input name="phone" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Input name="role" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select name="department" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input name="position" required className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employment Type</Label>
                    <Select name="employmentType" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Hire Date</Label>
                    <Input name="hireDate" type="date" required className="cyber-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salary</Label>
                    <Input
                      name="salary"
                      type="number"
                      step="0.01"
                      required
                      className="cyber-input"
                    />
                  </div>
                  <div>
                    <Label>Pay Frequency</Label>
                    <Select name="payFrequency" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input name="location" required className="cyber-input" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Performance Review Dialog */}
        <Dialog open={showPerformanceReview} onOpenChange={setShowPerformanceReview}>
          <DialogContent className="cyber-card max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Performance Review</DialogTitle>
              <DialogDescription>Evaluate employee performance</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createReviewMutation.mutate({
                  employeeId: formData.get("employeeId") as string,
                  reviewerId: formData.get("reviewerId") as string,
                  reviewPeriod: formData.get("reviewPeriod") as string,
                  reviewDate: formData.get("reviewDate") as string,
                  overallRating: parseFloat(formData.get("overallRating") as string),
                  strengths: formData.get("strengths") as string,
                  areasForImprovement: formData.get("areasForImprovement") as string,
                  goals: formData.get("goals") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employee</Label>
                    <Select name="employeeId" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reviewer</Label>
                    <Select name="reviewerId" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Review Period</Label>
                    <Input
                      name="reviewPeriod"
                      placeholder="Q1 2025"
                      required
                      className="cyber-input"
                    />
                  </div>
                  <div>
                    <Label>Review Date</Label>
                    <Input name="reviewDate" type="date" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Overall Rating (1-5)</Label>
                  <Input
                    name="overallRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    required
                    className="cyber-input"
                  />
                </div>
                <div>
                  <Label>Strengths</Label>
                  <Textarea
                    name="strengths"
                    placeholder="Key strengths and accomplishments..."
                    required
                    className="cyber-input"
                  />
                </div>
                <div>
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    name="areasForImprovement"
                    placeholder="Areas that need development..."
                    required
                    className="cyber-input"
                  />
                </div>
                <div>
                  <Label>Goals for Next Period</Label>
                  <Textarea
                    name="goals"
                    placeholder="Goals and objectives..."
                    required
                    className="cyber-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPerformanceReview(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  Create Review
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
