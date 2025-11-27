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
  DialogTrigger,
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
  Calendar,
  Clock,
  Download,
  Plus,
  Search,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  CalendarDays,
  UserCheck,
  Briefcase,
  Moon,
  Sun,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "moderator" | "admin" | "developer" | "content_reviewer" | "support" | "manager";
  department: string;
  avatar?: string;
  status: "active" | "on_leave" | "inactive";
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: "morning" | "afternoon" | "evening" | "night" | "full_day";
  status: "scheduled" | "in_progress" | "completed" | "missed";
  location: "office" | "remote" | "hybrid";
  notes?: string;
}

interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  type: "vacation" | "sick" | "personal" | "unpaid" | "bereavement" | "other";
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  role: string;
  pattern: "weekly" | "biweekly" | "monthly" | "custom";
  shifts: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    shiftType: string;
  }>;
}

function apiRequest(url: string, method: string, data?: any) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then((res) => res.json());
}

export default function ScheduleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddShift, setShowAddShift] = useState(false);
  const [showTimeOffRequest, setShowTimeOffRequest] = useState(false);
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOffRequest | null>(null);

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/hr/employees"],
    refetchInterval: 30000,
  });

  // Fetch shifts for selected date/range
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/schedule/shifts", selectedDate, selectedRole],
    refetchInterval: 15000,
  });

  // Fetch time-off requests
  const { data: timeOffRequests = [] } = useQuery<TimeOffRequest[]>({
    queryKey: ["/api/schedule/time-off"],
    refetchInterval: 30000,
  });

  // Fetch schedule templates
  const { data: templates = [] } = useQuery<ScheduleTemplate[]>({
    queryKey: ["/api/schedule/templates"],
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: (data: Partial<Shift>) => apiRequest("/api/schedule/shifts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/shifts"] });
      toast({ title: "Shift created successfully" });
      setShowAddShift(false);
    },
  });

  // Create time-off request mutation
  const createTimeOffMutation = useMutation({
    mutationFn: (data: Partial<TimeOffRequest>) =>
      apiRequest("/api/schedule/time-off", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/time-off"] });
      toast({ title: "Time-off request submitted successfully" });
      setShowTimeOffRequest(false);
    },
  });

  // Approve/reject time-off mutation
  const reviewTimeOffMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "approved" | "rejected";
      notes?: string;
    }) => apiRequest(`/api/schedule/time-off/${id}/review`, "POST", { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/time-off"] });
      toast({ title: "Time-off request reviewed" });
      setSelectedTimeOff(null);
    },
  });

  // Export to CSV function
  const handleExportCSV = (type: "shifts" | "time-off") => {
    const data = type === "shifts" ? shifts : timeOffRequests;

    if (data.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    let csv = "";
    if (type === "shifts") {
      csv = "Employee Name,Role,Date,Start Time,End Time,Shift Type,Location,Status\n";
      shifts.forEach((shift) => {
        csv += `${shift.employeeName},${shift.role},${shift.date},${shift.startTime},${shift.endTime},${shift.shiftType},${shift.location},${shift.status}\n`;
      });
    } else {
      csv = "Employee Name,Role,Start Date,End Date,Total Days,Type,Reason,Status,Requested Date\n";
      timeOffRequests.forEach((req) => {
        csv += `${req.employeeName},${req.role},${req.startDate},${req.endDate},${req.totalDays},${req.type},"${req.reason}",${req.status},${req.requestedDate}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: `${type === "shifts" ? "Shifts" : "Time-off requests"} exported successfully` });
  };

  // Get shifts for a specific week view
  const getWeekDays = () => {
    const date = new Date(selectedDate);
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day.toISOString().split("T")[0]);
    }
    return week;
  };

  // Filter shifts by role and search
  const filteredShifts = shifts.filter((shift) => {
    const matchesRole = selectedRole === "all" || shift.role === selectedRole;
    const matchesSearch =
      searchQuery === "" ||
      shift.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filter time-off requests
  const pendingTimeOff = timeOffRequests.filter((req) => req.status === "pending");
  const approvedTimeOff = timeOffRequests.filter((req) => req.status === "approved");

  // Get shift type icon
  const getShiftTypeIcon = (type: string) => {
    switch (type) {
      case "morning":
        return <Sun className="h-4 w-4" />;
      case "afternoon":
        return <Sun className="h-4 w-4" />;
      case "evening":
        return <Moon className="h-4 w-4" />;
      case "night":
        return <Moon className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
      case "scheduled":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
      case "missed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold cyber-text-glow">
              Schedule Management
            </h1>
            <p className="text-gray-400 mt-2">
              Manage employee schedules, shifts, and time-off requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportCSV("shifts")}
              variant="outline"
              className="border-cyan-500/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Shifts
            </Button>
            <Button
              onClick={() => setShowAddShift(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
            <Button
              onClick={() => setShowTimeOffRequest(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold mt-1">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today's Shifts</p>
                <p className="text-2xl font-bold mt-1">
                  {shifts.filter((s) => s.date === selectedDate).length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold mt-1">{pendingTimeOff.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">On Leave Today</p>
                <p className="text-2xl font-bold mt-1">
                  {
                    approvedTimeOff.filter(
                      (req) => req.startDate <= selectedDate && req.endDate >= selectedDate
                    ).length
                  }
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="cyber-card">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="shifts">All Shifts</TabsTrigger>
            <TabsTrigger value="time-off">Time-Off Requests</TabsTrigger>
            <TabsTrigger value="templates">Schedule Templates</TabsTrigger>
          </TabsList>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="cyber-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Filter by Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="content_reviewer">Content Reviewer</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Search Employee</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="cyber-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Week View */}
                <div className="grid grid-cols-7 gap-2 mt-6">
                  {getWeekDays().map((day) => {
                    const dayShifts = filteredShifts.filter((s) => s.date === day);
                    const isToday = day === new Date().toISOString().split("T")[0];
                    const isSelected = day === selectedDate;

                    return (
                      <div
                        key={day}
                        className={`cyber-card p-3 min-h-[200px] cursor-pointer transition-all ${
                          isToday ? "border-cyan-500/50" : ""
                        } ${isSelected ? "bg-cyan-500/10" : ""}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-center mb-2">
                          <p className="text-xs text-gray-400">
                            {new Date(day).toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                          <p className="text-lg font-bold">
                            {new Date(day).getDate()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {dayShifts.slice(0, 3).map((shift) => (
                            <div
                              key={shift.id}
                              className="text-xs p-2 rounded bg-cyan-500/10 border border-cyan-500/30"
                            >
                              <p className="font-semibold truncate">{shift.employeeName}</p>
                              <p className="text-gray-400">
                                {shift.startTime} - {shift.endTime}
                              </p>
                            </div>
                          ))}
                          {dayShifts.length > 3 && (
                            <p className="text-xs text-center text-gray-400">
                              +{dayShifts.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Day Details */}
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold mb-4">
                    Shifts for {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {filteredShifts
                      .filter((s) => s.date === selectedDate)
                      .map((shift) => (
                        <div
                          key={shift.id}
                          className="cyber-card p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            {getShiftTypeIcon(shift.shiftType)}
                            <div>
                              <p className="font-semibold">{shift.employeeName}</p>
                              <p className="text-sm text-gray-400">
                                {shift.role} • {shift.startTime} - {shift.endTime} •{" "}
                                {shift.location}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status}
                          </Badge>
                        </div>
                      ))}
                    {filteredShifts.filter((s) => s.date === selectedDate).length === 0 && (
                      <p className="text-center text-gray-400 py-8">
                        No shifts scheduled for this day
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* All Shifts Tab */}
          <TabsContent value="shifts" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">All Scheduled Shifts</h3>
                  <Button
                    onClick={() => handleExportCSV("shifts")}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="cyber-card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {getShiftTypeIcon(shift.shiftType)}
                        <div className="flex-1">
                          <p className="font-semibold">{shift.employeeName}</p>
                          <p className="text-sm text-gray-400">
                            {shift.role} • {new Date(shift.date).toLocaleDateString()} •{" "}
                            {shift.startTime} - {shift.endTime} • {shift.location}
                          </p>
                          {shift.notes && (
                            <p className="text-xs text-gray-500 mt-1">{shift.notes}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>
                  ))}
                  {filteredShifts.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No shifts found</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Time-Off Requests Tab */}
          <TabsContent value="time-off" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-6">
                {/* Pending Requests */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Pending Requests ({pendingTimeOff.length})</h3>
                    <Button
                      onClick={() => handleExportCSV("time-off")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pendingTimeOff.map((request) => (
                      <div
                        key={request.id}
                        className="cyber-card p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{request.employeeName}</p>
                            <Badge variant="outline">{request.role}</Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {request.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()} ({request.totalDays}{" "}
                            days)
                          </p>
                          <p className="text-sm text-gray-300 mt-1">{request.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested on {new Date(request.requestedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              reviewTimeOffMutation.mutate({ id: request.id, status: "approved" })
                            }
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTimeOff(request)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingTimeOff.length === 0 && (
                      <p className="text-center text-gray-400 py-8">
                        No pending time-off requests
                      </p>
                    )}
                  </div>
                </div>

                {/* Approved Requests */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold mb-4">
                    Approved Requests ({approvedTimeOff.length})
                  </h3>
                  <div className="space-y-2">
                    {approvedTimeOff.slice(0, 10).map((request) => (
                      <div
                        key={request.id}
                        className="cyber-card p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{request.employeeName}</p>
                            <Badge variant="outline">{request.role}</Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {request.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()} ({request.totalDays}{" "}
                            days)
                          </p>
                          <p className="text-sm text-gray-300 mt-1">{request.reason}</p>
                          {request.reviewedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Approved by {request.reviewedBy} on{" "}
                              {request.reviewedDate ? new Date(request.reviewedDate).toLocaleDateString() : "N/A"}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                    {approvedTimeOff.length === 0 && (
                      <p className="text-center text-gray-400 py-8">No approved requests</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Schedule Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="cyber-card p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Schedule Templates</h3>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="cyber-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline">{template.role}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Pattern: {template.pattern}
                      </p>
                      <div className="space-y-1">
                        {template.shifts.map((shift, idx) => (
                          <div key={idx} className="text-xs p-2 rounded bg-gray-800/50">
                            <p>
                              Day {shift.dayOfWeek}: {shift.startTime} - {shift.endTime}
                            </p>
                            <p className="text-gray-500">{shift.shiftType}</p>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Apply Template
                      </Button>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No templates created yet
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Shift Dialog */}
        <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
              <DialogDescription>Schedule a new shift for an employee</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createShiftMutation.mutate({
                  employeeId: formData.get("employeeId") as string,
                  date: formData.get("date") as string,
                  startTime: formData.get("startTime") as string,
                  endTime: formData.get("endTime") as string,
                  shiftType: formData.get("shiftType") as any,
                  location: formData.get("location") as any,
                  notes: formData.get("notes") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Employee</Label>
                  <Select name="employeeId" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      name="date"
                      required
                      className="cyber-input"
                      defaultValue={selectedDate}
                    />
                  </div>
                  <div>
                    <Label>Shift Type</Label>
                    <Select name="shiftType" required>
                      <SelectTrigger className="cyber-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6AM-2PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (2PM-10PM)</SelectItem>
                        <SelectItem value="evening">Evening (10PM-6AM)</SelectItem>
                        <SelectItem value="night">Night (10PM-6AM)</SelectItem>
                        <SelectItem value="full_day">Full Day (9AM-5PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" name="startTime" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" name="endTime" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Select name="location" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    name="notes"
                    placeholder="Any additional notes..."
                    className="cyber-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddShift(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  Create Shift
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Time-Off Request Dialog */}
        <Dialog open={showTimeOffRequest} onOpenChange={setShowTimeOffRequest}>
          <DialogContent className="cyber-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>Submit a time-off request for approval</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const startDate = formData.get("startDate") as string;
                const endDate = formData.get("endDate") as string;
                const totalDays = Math.ceil(
                  (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;

                createTimeOffMutation.mutate({
                  employeeId: formData.get("employeeId") as string,
                  startDate,
                  endDate,
                  totalDays,
                  type: formData.get("type") as any,
                  reason: formData.get("reason") as string,
                });
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Employee</Label>
                  <Select name="employeeId" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" name="startDate" required className="cyber-input" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" name="endDate" required className="cyber-input" />
                  </div>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select name="type" required>
                    <SelectTrigger className="cyber-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    name="reason"
                    placeholder="Please provide a reason for your time-off request..."
                    required
                    className="cyber-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTimeOffRequest(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Time-Off Dialog */}
        <Dialog open={!!selectedTimeOff} onOpenChange={() => setSelectedTimeOff(null)}>
          <DialogContent className="cyber-card">
            <DialogHeader>
              <DialogTitle>Reject Time-Off Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (selectedTimeOff) {
                  reviewTimeOffMutation.mutate({
                    id: selectedTimeOff.id,
                    status: "rejected",
                    notes: formData.get("notes") as string,
                  });
                }
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label>Rejection Reason</Label>
                  <Textarea
                    name="notes"
                    placeholder="Explain why this request is being rejected..."
                    required
                    className="cyber-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedTimeOff(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Reject Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
