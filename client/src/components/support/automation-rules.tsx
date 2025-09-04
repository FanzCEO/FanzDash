import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  Zap,
  Clock,
  ArrowRight,
  Play,
  Pause,
  Filter,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bot,
  Workflow,
  Calendar,
  User,
  Tag,
  Mail,
  MessageSquare,
  Flag,
  Timer,
  Hash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    value: any;
    delay?: number;
  }>;
  isActive: boolean;
  priority: number;
  departmentId: string;
  departmentName: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
  departmentId: string;
}

interface AutomationRulesProps {
  rules: AutomationRule[];
  departments: Department[];
  agents: Agent[];
  onCreateRule: (data: {
    name: string;
    description: string;
    trigger: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    actions: Array<{
      type: string;
      value: any;
      delay?: number;
    }>;
    departmentId: string;
    priority: number;
  }) => Promise<void>;
  onUpdateRule: (id: string, data: Partial<AutomationRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onToggleRule: (id: string, isActive: boolean) => Promise<void>;
  currentUser: {
    id: string;
    name: string;
    role: string;
    departmentId: string;
  };
  className?: string;
}

const TRIGGERS = [
  { id: "ticket_created", name: "Ticket Created", icon: Plus },
  { id: "status_changed", name: "Status Changed", icon: Activity },
  { id: "priority_changed", name: "Priority Changed", icon: Flag },
  { id: "assigned", name: "Ticket Assigned", icon: User },
  { id: "message_received", name: "Message Received", icon: MessageSquare },
  { id: "time_elapsed", name: "Time Elapsed", icon: Clock },
  { id: "satisfaction_rated", name: "Satisfaction Rated", icon: Target },
];

const CONDITIONS = [
  { field: "priority", operators: ["equals", "not_equals"], name: "Priority" },
  { field: "status", operators: ["equals", "not_equals"], name: "Status" },
  { field: "category", operators: ["equals", "not_equals"], name: "Category" },
  {
    field: "assignee",
    operators: ["equals", "not_equals", "is_empty"],
    name: "Assignee",
  },
  {
    field: "customer_email",
    operators: ["contains", "not_contains", "equals"],
    name: "Customer Email",
  },
  {
    field: "subject",
    operators: ["contains", "not_contains"],
    name: "Subject",
  },
  {
    field: "description",
    operators: ["contains", "not_contains"],
    name: "Description",
  },
  { field: "tags", operators: ["contains", "not_contains"], name: "Tags" },
  {
    field: "response_time",
    operators: ["greater_than", "less_than"],
    name: "Response Time (hours)",
  },
];

const ACTIONS = [
  { type: "assign", name: "Assign to Agent", icon: User },
  { type: "change_priority", name: "Change Priority", icon: Flag },
  { type: "change_status", name: "Change Status", icon: Activity },
  { type: "add_tag", name: "Add Tag", icon: Tag },
  { type: "remove_tag", name: "Remove Tag", icon: Tag },
  { type: "send_email", name: "Send Email", icon: Mail },
  { type: "add_note", name: "Add Internal Note", icon: MessageSquare },
  { type: "escalate", name: "Escalate Ticket", icon: TrendingUp },
  { type: "close_ticket", name: "Close Ticket", icon: XCircle },
];

export function AutomationRules({
  rules,
  departments,
  agents,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
  currentUser,
  className = "",
}: AutomationRulesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedTrigger, setSelectedTrigger] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "",
    conditions: [] as Array<{ field: string; operator: string; value: any }>,
    actions: [] as Array<{ type: string; value: any; delay?: number }>,
    departmentId: currentUser.departmentId,
    priority: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || rule.departmentId === selectedDepartment;
    const matchesTrigger =
      selectedTrigger === "all" || rule.trigger === selectedTrigger;

    // Role-based filtering
    const canView =
      currentUser.role === "admin" ||
      currentUser.role === "supervisor" ||
      rule.departmentId === currentUser.departmentId;

    return matchesSearch && matchesDepartment && matchesTrigger && canView;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      trigger: "",
      conditions: [],
      actions: [],
      departmentId: currentUser.departmentId,
      priority: 1,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.trigger) errors.trigger = "Trigger is required";
    if (formData.conditions.length === 0)
      errors.conditions = "At least one condition is required";
    if (formData.actions.length === 0)
      errors.actions = "At least one action is required";
    if (!formData.departmentId) errors.departmentId = "Department is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingRule) {
        await onUpdateRule(editingRule.id, formData);
      } else {
        await onCreateRule(formData);
      }
      setIsCreateDialogOpen(false);
      setEditingRule(null);
      resetForm();
    } catch (error: any) {
      setFormErrors({ submit: error.message || "Failed to save rule" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
      departmentId: rule.departmentId,
      priority: rule.priority,
    });
    setIsCreateDialogOpen(true);
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: "", operator: "", value: "" }],
    }));
  };

  const updateCondition = (
    index: number,
    updates: Partial<(typeof formData.conditions)[0]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, ...updates } : condition,
      ),
    }));
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: "", value: "", delay: 0 }],
    }));
  };

  const updateAction = (
    index: number,
    updates: Partial<(typeof formData.actions)[0]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action,
      ),
    }));
  };

  const removeAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const RuleCard = ({ rule }: { rule: AutomationRule }) => {
    const triggerInfo = TRIGGERS.find((t) => t.id === rule.trigger);
    const TriggerIcon = triggerInfo?.icon || Zap;

    return (
      <Card
        className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
          rule.isActive ? "border-l-green-500" : "border-l-gray-300"
        }`}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    <TriggerIcon className="h-3 w-3 mr-1" />
                    {triggerInfo?.name || rule.trigger}
                  </Badge>
                  <Badge variant="outline">
                    <Hash className="h-3 w-3 mr-1" />
                    Priority {rule.priority}
                  </Badge>
                  {!rule.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>

                <h3 className="font-bold text-lg">{rule.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(rule)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Rule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Conditions Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">When:</h4>
              <div className="space-y-1 text-sm">
                {rule.conditions.slice(0, 2).map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-muted-foreground"
                  >
                    <span className="capitalize">
                      {condition.field.replace("_", " ")}
                    </span>
                    <span>{condition.operator.replace("_", " ")}</span>
                    <span className="font-medium">"{condition.value}"</span>
                  </div>
                ))}
                {rule.conditions.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{rule.conditions.length - 2} more conditions
                  </div>
                )}
              </div>
            </div>

            {/* Actions Preview */}
            <div className="bg-primary/5 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Then:</h4>
              <div className="space-y-1 text-sm">
                {rule.actions.slice(0, 2).map((action, index) => {
                  const actionInfo = ACTIONS.find(
                    (a) => a.type === action.type,
                  );
                  const ActionIcon = actionInfo?.icon || Zap;

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-muted-foreground"
                    >
                      <ActionIcon className="h-3 w-3" />
                      <span>{actionInfo?.name}</span>
                      {action.delay && action.delay > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Timer className="h-2 w-2 mr-1" />
                          {action.delay}min delay
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {rule.actions.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{rule.actions.length - 2} more actions
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span>{rule.executionCount} executions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{rule.departmentName}</span>
                </div>
              </div>

              <div className="text-right">
                {rule.lastExecutedAt ? (
                  <div>
                    Last executed{" "}
                    {formatDistanceToNow(new Date(rule.lastExecutedAt), {
                      addSuffix: true,
                    })}
                  </div>
                ) : (
                  <div>Never executed</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary" />
            <span>Automation Rules</span>
          </h1>
          <p className="text-muted-foreground">
            Create automated workflows to streamline ticket management
          </p>
        </div>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingRule(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Automation Rule
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule
                  ? "Edit Automation Rule"
                  : "Create New Automation Rule"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {formErrors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Auto-assign urgent tickets"
                    className={formErrors.name ? "border-red-500" : ""}
                    data-testid="rule-name-input"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, departmentId: value }))
                    }
                  >
                    <SelectTrigger
                      className={
                        formErrors.departmentId ? "border-red-500" : ""
                      }
                      data-testid="rule-department-select"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.departmentId && (
                    <p className="text-sm text-red-600">
                      {formErrors.departmentId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger *</Label>
                  <Select
                    value={formData.trigger}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, trigger: value }))
                    }
                  >
                    <SelectTrigger
                      className={formErrors.trigger ? "border-red-500" : ""}
                      data-testid="rule-trigger-select"
                    >
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((trigger) => {
                        const Icon = trigger.icon;
                        return (
                          <SelectItem key={trigger.id} value={trigger.id}>
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{trigger.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {formErrors.trigger && (
                    <p className="text-sm text-red-600">{formErrors.trigger}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger data-testid="rule-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <SelectItem key={priority} value={priority.toString()}>
                          Priority {priority} {priority === 1 && "(Highest)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what this rule does..."
                  rows={2}
                  data-testid="rule-description-input"
                />
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Conditions (When) *
                  </Label>
                  <Button
                    type="button"
                    onClick={addCondition}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                {formData.conditions.map((condition, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        value={condition.field}
                        onValueChange={(value) =>
                          updateCondition(index, { field: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((field) => (
                            <SelectItem key={field.field} value={field.field}>
                              {field.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(index, { operator: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {condition.field &&
                            CONDITIONS.find(
                              (c) => c.field === condition.field,
                            )?.operators.map((operator) => (
                              <SelectItem key={operator} value={operator}>
                                {operator.replace("_", " ").toUpperCase()}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(index, { value: e.target.value })
                        }
                        placeholder="Value"
                      />

                      <Button
                        type="button"
                        onClick={() => removeCondition(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {formErrors.conditions && (
                  <p className="text-sm text-red-600">
                    {formErrors.conditions}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Actions (Then) *
                  </Label>
                  <Button
                    type="button"
                    onClick={addAction}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>

                {formData.actions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <Select
                        value={action.type}
                        onValueChange={(value) =>
                          updateAction(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIONS.map((actionType) => {
                            const Icon = actionType.icon;
                            return (
                              <SelectItem
                                key={actionType.type}
                                value={actionType.type}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{actionType.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      <Input
                        value={action.value}
                        onChange={(e) =>
                          updateAction(index, { value: e.target.value })
                        }
                        placeholder="Value"
                      />

                      <Input
                        type="number"
                        value={action.delay || 0}
                        onChange={(e) =>
                          updateAction(index, {
                            delay: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Delay (min)"
                        min={0}
                      />

                      <Button
                        type="button"
                        onClick={() => removeAction(index)}
                        variant="outline"
                        size="sm"
                        className="md:col-span-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}

                {formErrors.actions && (
                  <p className="text-sm text-red-600">{formErrors.actions}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-purple-600"
                  data-testid="save-rule-btn"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingRule
                      ? "Update Rule"
                      : "Create Rule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rules.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {rules.filter((r) => r.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {rules.reduce((sum, r) => sum + r.executionCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Executions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {
                rules.filter(
                  (r) =>
                    r.lastExecutedAt &&
                    new Date(r.lastExecutedAt) >
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Executed Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search automation rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="rules-search-input"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTrigger}
                onValueChange={setSelectedTrigger}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  {TRIGGERS.map((trigger) => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      {trigger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Grid */}
      {filteredRules.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No Automation Rules Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "No rules match your search criteria."
                : "Start automating your support workflow by creating your first automation rule."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AutomationRules;
