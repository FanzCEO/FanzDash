import { db } from "../db";
import { workflowDefinitions } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// 🔄 WORKFLOW BUILDER SERVICE
// Visual workflow automation for creators and admins across all FANZ platforms

export interface WorkflowTrigger {
  type: "event" | "schedule" | "webhook" | "condition";
  config: {
    // Event triggers
    eventType?: string; // "post_published", "new_subscriber", "payment_received", etc.

    // Schedule triggers
    schedule?: {
      type: "cron" | "interval" | "once";
      cron?: string; // "0 9 * * *" = daily at 9am
      interval?: number; // milliseconds
      startAt?: Date;
      endAt?: Date;
    };

    // Webhook triggers
    webhook?: {
      url: string;
      secret: string;
      method: "POST" | "GET";
    };

    // Condition triggers
    condition?: {
      field: string;
      operator: "equals" | "greater_than" | "less_than" | "contains";
      value: any;
    };
  };
}

export interface WorkflowAction {
  type: "send_email" | "send_sms" | "post_social" | "create_content" | "update_crm" | "webhook" | "delay" | "branch";
  config: {
    // Email action
    email?: {
      to: string;
      subject: string;
      template: string;
      variables?: Record<string, any>;
    };

    // SMS action
    sms?: {
      to: string;
      message: string;
    };

    // Social post action
    socialPost?: {
      platforms: string[]; // ["twitter", "instagram", "facebook"]
      content: string;
      media?: string[];
      schedule?: Date;
    };

    // Content creation
    content?: {
      type: "post" | "story" | "video" | "clip";
      platformId: string;
      data: Record<string, any>;
    };

    // CRM update
    crm?: {
      entity: "fan" | "creator" | "subscription";
      action: "create" | "update" | "tag";
      data: Record<string, any>;
    };

    // Webhook action
    webhook?: {
      url: string;
      method: "POST" | "GET" | "PUT";
      headers?: Record<string, string>;
      body?: Record<string, any>;
    };

    // Delay action
    delay?: {
      duration: number; // milliseconds
      unit: "seconds" | "minutes" | "hours" | "days";
    };

    // Branch action
    branch?: {
      condition: {
        field: string;
        operator: string;
        value: any;
      };
      truePath: string[]; // action IDs
      falsePath: string[]; // action IDs
    };
  };
}

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in" | "not_in";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  position: { x: number; y: number };
  data: WorkflowTrigger | WorkflowAction | WorkflowCondition;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  context: Record<string, any>;
  steps: Array<{
    nodeId: string;
    status: "pending" | "running" | "completed" | "failed" | "skipped";
    startedAt: Date;
    completedAt?: Date;
    output?: any;
    error?: string;
  }>;
}

export class WorkflowService {
  private static instance: WorkflowService;
  private executions: Map<string, WorkflowExecution> = new Map();
  private scheduledWorkflows: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeScheduledWorkflows();
  }

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * Create or update workflow definition
   */
  async saveWorkflow(
    userId: string,
    platformId: string,
    workflow: {
      name: string;
      category: string;
      triggers: WorkflowTrigger[];
      actions: WorkflowAction[];
      conditions?: WorkflowCondition[];
      nodeData?: WorkflowNode[];
      edgeData?: WorkflowEdge[];
      schedule?: any;
      timezone?: string;
    },
    workflowId?: string
  ): Promise<any> {
    try {
      const workflowData = {
        userId,
        platformId,
        name: workflow.name,
        category: workflow.category,
        triggers: workflow.triggers,
        actions: workflow.actions,
        conditions: workflow.conditions || [],
        nodeData: workflow.nodeData || {},
        edgeData: workflow.edgeData || {},
        schedule: workflow.schedule,
        timezone: workflow.timezone || "UTC",
        isActive: true,
        updatedAt: new Date(),
      };

      let result;
      if (workflowId) {
        // Update existing workflow
        result = await db
          .update(workflowDefinitions)
          .set(workflowData)
          .where(eq(workflowDefinitions.id, workflowId))
          .returning();
      } else {
        // Create new workflow
        result = await db
          .insert(workflowDefinitions)
          .values(workflowData)
          .returning();
      }

      const savedWorkflow = result[0];

      // Schedule if needed
      if (savedWorkflow.schedule) {
        await this.scheduleWorkflow(savedWorkflow.id, savedWorkflow.schedule);
      }

      return savedWorkflow;
    } catch (error) {
      console.error("Error saving workflow:", error);
      throw error;
    }
  }

  /**
   * Get user's workflows
   */
  async getUserWorkflows(userId: string, platformId?: string) {
    try {
      const conditions = [eq(workflowDefinitions.userId, userId)];

      if (platformId) {
        conditions.push(eq(workflowDefinitions.platformId, platformId));
      }

      return await db
        .select()
        .from(workflowDefinitions)
        .where(and(...conditions, eq(workflowDefinitions.isActive, true)))
        .orderBy(desc(workflowDefinitions.createdAt));
    } catch (error) {
      console.error("Error fetching workflows:", error);
      return [];
    }
  }

  /**
   * Get single workflow
   */
  async getWorkflow(workflowId: string) {
    try {
      const result = await db
        .select()
        .from(workflowDefinitions)
        .where(eq(workflowDefinitions.id, workflowId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error fetching workflow:", error);
      return null;
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      // Cancel scheduled execution
      if (this.scheduledWorkflows.has(workflowId)) {
        clearTimeout(this.scheduledWorkflows.get(workflowId)!);
        this.scheduledWorkflows.delete(workflowId);
      }

      await db
        .update(workflowDefinitions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(workflowDefinitions.id, workflowId));

      return true;
    } catch (error) {
      console.error("Error deleting workflow:", error);
      return false;
    }
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(
    workflowId: string,
    context: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const execution: WorkflowExecution = {
      executionId,
      workflowId,
      status: "pending",
      startedAt: new Date(),
      context,
      steps: [],
    };

    this.executions.set(executionId, execution);

    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      execution.status = "running";

      // Process workflow nodes in order
      const nodes = workflow.nodeData as WorkflowNode[];
      const edges = workflow.edgeData as WorkflowEdge[];

      if (nodes && nodes.length > 0) {
        await this.executeNodeGraph(execution, nodes, edges, context);
      } else {
        // Legacy: execute actions sequentially
        for (const action of workflow.actions) {
          const step = {
            nodeId: `action_${Date.now()}`,
            status: "running" as const,
            startedAt: new Date(),
          };

          execution.steps.push(step);

          try {
            const output = await this.executeAction(action, context);
            step.status = "completed";
            step.completedAt = new Date();
            step.output = output;
          } catch (error: any) {
            step.status = "failed";
            step.completedAt = new Date();
            step.error = error.message;
            throw error;
          }
        }
      }

      execution.status = "completed";
      execution.completedAt = new Date();

      // Update stats
      await this.updateWorkflowStats(workflowId, execution);
    } catch (error: any) {
      execution.status = "failed";
      execution.completedAt = new Date();
      execution.error = error.message;
    }

    return execution;
  }

  /**
   * Execute node graph
   */
  private async executeNodeGraph(
    execution: WorkflowExecution,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    context: Record<string, any>
  ): Promise<void> {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgesBySource = new Map<string, WorkflowEdge[]>();

    // Build edge map
    edges.forEach(edge => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source)!.push(edge);
    });

    // Find trigger node (start)
    const triggerNode = nodes.find(n => n.type === "trigger");
    if (!triggerNode) {
      throw new Error("No trigger node found");
    }

    // Execute from trigger
    await this.executeNode(triggerNode, execution, nodeMap, edgesBySource, context);
  }

  /**
   * Execute single node
   */
  private async executeNode(
    node: WorkflowNode,
    execution: WorkflowExecution,
    nodeMap: Map<string, WorkflowNode>,
    edgesBySource: Map<string, WorkflowEdge[]>,
    context: Record<string, any>
  ): Promise<any> {
    const step = {
      nodeId: node.id,
      status: "running" as const,
      startedAt: new Date(),
    };

    execution.steps.push(step);

    try {
      let output: any;

      if (node.type === "action") {
        output = await this.executeAction(node.data as WorkflowAction, context);
      } else if (node.type === "condition") {
        output = this.evaluateCondition(node.data as WorkflowCondition, context);
      }

      step.status = "completed";
      step.completedAt = new Date();
      step.output = output;

      // Execute next nodes
      const nextEdges = edgesBySource.get(node.id) || [];
      for (const edge of nextEdges) {
        // For conditions, check edge label
        if (node.type === "condition") {
          if ((output && edge.label === "true") || (!output && edge.label === "false")) {
            const nextNode = nodeMap.get(edge.target);
            if (nextNode) {
              await this.executeNode(nextNode, execution, nodeMap, edgesBySource, context);
            }
          }
        } else {
          const nextNode = nodeMap.get(edge.target);
          if (nextNode) {
            await this.executeNode(nextNode, execution, nodeMap, edgesBySource, context);
          }
        }
      }

      return output;
    } catch (error: any) {
      step.status = "failed";
      step.completedAt = new Date();
      step.error = error.message;
      throw error;
    }
  }

  /**
   * Execute single action
   */
  private async executeAction(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<any> {
    switch (action.type) {
      case "send_email":
        return await this.sendEmail(action.config.email!, context);

      case "send_sms":
        return await this.sendSMS(action.config.sms!, context);

      case "post_social":
        return await this.postToSocial(action.config.socialPost!, context);

      case "create_content":
        return await this.createContent(action.config.content!, context);

      case "update_crm":
        return await this.updateCRM(action.config.crm!, context);

      case "webhook":
        return await this.callWebhook(action.config.webhook!, context);

      case "delay":
        return await this.delay(action.config.delay!);

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return null;
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(
    condition: WorkflowCondition,
    context: Record<string, any>
  ): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "not_equals":
        return fieldValue !== condition.value;
      case "greater_than":
        return fieldValue > condition.value;
      case "less_than":
        return fieldValue < condition.value;
      case "contains":
        return String(fieldValue).includes(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Action implementations
   */
  private async sendEmail(config: any, context: Record<string, any>): Promise<any> {
    // Integrate with email service (SendGrid, etc.)
    console.log("Sending email:", config);
    return { sent: true, to: config.to };
  }

  private async sendSMS(config: any, context: Record<string, any>): Promise<any> {
    // Integrate with SMS service (Twilio, etc.)
    console.log("Sending SMS:", config);
    return { sent: true, to: config.to };
  }

  private async postToSocial(config: any, context: Record<string, any>): Promise<any> {
    // Integrate with social OAuth service
    const { socialOAuthService } = await import("./socialOAuthService");
    console.log("Posting to social:", config);
    return { posted: true, platforms: config.platforms };
  }

  private async createContent(config: any, context: Record<string, any>): Promise<any> {
    // Create content via FanzMediaCore
    console.log("Creating content:", config);
    return { created: true, type: config.type };
  }

  private async updateCRM(config: any, context: Record<string, any>): Promise<any> {
    // Update CRM records
    console.log("Updating CRM:", config);
    return { updated: true, entity: config.entity };
  }

  private async callWebhook(config: any, context: Record<string, any>): Promise<any> {
    const response = await fetch(config.url, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    return await response.json();
  }

  private async delay(config: any): Promise<void> {
    const ms = this.convertToMilliseconds(config.duration, config.unit);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Schedule workflow
   */
  private async scheduleWorkflow(workflowId: string, schedule: any): Promise<void> {
    // Cancel existing schedule
    if (this.scheduledWorkflows.has(workflowId)) {
      clearTimeout(this.scheduledWorkflows.get(workflowId)!);
    }

    if (schedule.type === "interval") {
      const interval = setInterval(() => {
        this.executeWorkflow(workflowId);
      }, schedule.interval);

      this.scheduledWorkflows.set(workflowId, interval as any);
    }
    // Add cron scheduling here with node-cron or similar
  }

  /**
   * Initialize scheduled workflows on startup
   */
  private async initializeScheduledWorkflows(): Promise<void> {
    try {
      const workflows = await db
        .select()
        .from(workflowDefinitions)
        .where(eq(workflowDefinitions.isActive, true));

      for (const workflow of workflows) {
        if (workflow.schedule) {
          await this.scheduleWorkflow(workflow.id, workflow.schedule);
        }
      }
    } catch (error) {
      console.error("Error initializing scheduled workflows:", error);
    }
  }

  /**
   * Update workflow statistics
   */
  private async updateWorkflowStats(
    workflowId: string,
    execution: WorkflowExecution
  ): Promise<void> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) return;

      const executionTime = execution.completedAt
        ? execution.completedAt.getTime() - execution.startedAt.getTime()
        : 0;

      const avgTime =
        workflow.executionCount > 0
          ? (workflow.averageExecutionTime * workflow.executionCount + executionTime) /
            (workflow.executionCount + 1)
          : executionTime;

      await db
        .update(workflowDefinitions)
        .set({
          executionCount: workflow.executionCount + 1,
          lastExecuted: execution.startedAt,
          averageExecutionTime: Math.round(avgTime),
        })
        .where(eq(workflowDefinitions.id, workflowId));
    } catch (error) {
      console.error("Error updating workflow stats:", error);
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());

    if (workflowId) {
      return executions.filter(e => e.workflowId === workflowId);
    }

    return executions;
  }

  /**
   * Helper methods
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private convertToMilliseconds(duration: number, unit: string): number {
    const conversions: Record<string, number> = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000,
    };

    return duration * (conversions[unit] || 1000);
  }
}

// Export singleton instance
export const workflowService = WorkflowService.getInstance();
