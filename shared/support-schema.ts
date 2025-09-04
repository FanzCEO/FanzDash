import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  decimal,
  uuid,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Support Departments
export const supportDepartments = pgTable("support_departments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  autoAssign: boolean("auto_assign").default(false),
  businessHours: jsonb("business_hours").$type<{
    timezone: string;
    schedule: Record<string, { open: string; close: string; closed: boolean }>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Agents (extends users table)
export const supportAgents = pgTable(
  "support_agents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    role: varchar("role", { length: 50 }).default("agent"), // agent, supervisor, admin
    maxTickets: integer("max_tickets").default(20),
    skills: jsonb("skills").$type<string[]>(),
    languages: jsonb("languages").$type<string[]>(),
    isActive: boolean("is_active").default(true),
    isOnline: boolean("is_online").default(false),
    lastActivity: timestamp("last_activity"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("support_agents_user_idx").on(table.userId),
    index("support_agents_dept_idx").on(table.departmentId),
  ],
);

// Support Tickets
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ticketNumber: varchar("ticket_number", { length: 20 }).unique().notNull(),
    customerId: varchar("customer_id").notNull(), // references users
    assignedAgentId: uuid("assigned_agent_id").references(
      () => supportAgents.id,
    ),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    categoryId: uuid("category_id").references(() => supportCategories.id),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
    status: varchar("status", { length: 20 }).default("open"), // open, pending, resolved, closed
    source: varchar("source", { length: 50 }).default("web"), // web, email, api, chat
    tags: jsonb("tags").$type<string[]>(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    firstResponseAt: timestamp("first_response_at"),
    resolvedAt: timestamp("resolved_at"),
    closedAt: timestamp("closed_at"),
    dueDate: timestamp("due_date"),
    escalatedAt: timestamp("escalated_at"),
    satisfactionRating: integer("satisfaction_rating"), // 1-5
    satisfactionComment: text("satisfaction_comment"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("tickets_customer_idx").on(table.customerId),
    index("tickets_agent_idx").on(table.assignedAgentId),
    index("tickets_dept_idx").on(table.departmentId),
    index("tickets_status_idx").on(table.status),
    index("tickets_priority_idx").on(table.priority),
    index("tickets_created_idx").on(table.createdAt),
  ],
);

// Ticket Categories
export const supportCategories: any = pgTable(
  "support_categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    parentId: uuid("parent_id"),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    color: varchar("color", { length: 7 }).default("#3B82F6"),
    isActive: boolean("is_active").default(true),
    autoAssignAgentId: uuid("auto_assign_agent_id").references(
      () => supportAgents.id,
    ),
    defaultPriority: varchar("default_priority", { length: 20 }).default(
      "medium",
    ),
    expectedResolutionTime: integer("expected_resolution_time"), // in minutes
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("categories_dept_idx").on(table.departmentId),
    index("categories_parent_idx").on(table.parentId),
  ],
);

// Ticket Messages/Replies
export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ticketId: uuid("ticket_id")
      .references(() => supportTickets.id)
      .notNull(),
    authorId: varchar("author_id").notNull(), // user_id or agent_id
    authorType: varchar("author_type", { length: 20 }).notNull(), // customer, agent, system
    message: text("message").notNull(),
    messageType: varchar("message_type", { length: 20 }).default("reply"), // reply, note, status_change
    attachments: jsonb("attachments").$type<
      Array<{
        id: string;
        name: string;
        url: string;
        size: number;
        type: string;
      }>
    >(),
    isInternal: boolean("is_internal").default(false),
    readBy: jsonb("read_by").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("messages_ticket_idx").on(table.ticketId),
    index("messages_author_idx").on(table.authorId),
    index("messages_created_idx").on(table.createdAt),
  ],
);

// Knowledge Base Articles
export const knowledgeBaseArticles = pgTable(
  "knowledge_base_articles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    categoryId: uuid("category_id").references(
      () => knowledgeBaseCategories.id,
    ),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    content: text("content").notNull(),
    summary: text("summary"),
    tags: jsonb("tags").$type<string[]>(),
    authorId: varchar("author_id").notNull(),
    isPublished: boolean("is_published").default(false),
    isFeatured: boolean("is_featured").default(false),
    viewCount: integer("view_count").default(0),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    language: varchar("language", { length: 5 }).default("en"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    lastReviewedAt: timestamp("last_reviewed_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("articles_category_idx").on(table.categoryId),
    index("articles_published_idx").on(table.isPublished),
    index("articles_slug_idx").on(table.slug),
    index("articles_language_idx").on(table.language),
  ],
);

// Knowledge Base Categories
export const knowledgeBaseCategories: any = pgTable(
  "knowledge_base_categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    parentId: uuid("parent_id"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 7 }).default("#3B82F6"),
    isPublished: boolean("is_published").default(true),
    sortOrder: integer("sort_order").default(0),
    language: varchar("language", { length: 5 }).default("en"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("kb_categories_parent_idx").on(table.parentId),
    index("kb_categories_published_idx").on(table.isPublished),
    index("kb_categories_language_idx").on(table.language),
  ],
);

// Canned Responses
export const cannedResponses = pgTable(
  "canned_responses",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    shortcut: varchar("shortcut", { length: 50 }),
    categoryId: uuid("category_id").references(() => supportCategories.id),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    isPublic: boolean("is_public").default(true), // shared with all agents
    authorId: varchar("author_id").notNull(),
    usageCount: integer("usage_count").default(0),
    tags: jsonb("tags").$type<string[]>(),
    language: varchar("language", { length: 5 }).default("en"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("canned_responses_dept_idx").on(table.departmentId),
    index("canned_responses_category_idx").on(table.categoryId),
    index("canned_responses_shortcut_idx").on(table.shortcut),
  ],
);

// Automation Rules
export const automationRules = pgTable(
  "automation_rules",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    trigger: varchar("trigger", { length: 50 }).notNull(), // ticket_created, status_changed, etc.
    conditions: jsonb("conditions").$type<
      Array<{
        field: string;
        operator: string;
        value: any;
      }>
    >(),
    actions: jsonb("actions").$type<
      Array<{
        type: string;
        value: any;
        delay?: number;
      }>
    >(),
    isActive: boolean("is_active").default(true),
    priority: integer("priority").default(0),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    executionCount: integer("execution_count").default(0),
    lastExecutedAt: timestamp("last_executed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("automation_rules_trigger_idx").on(table.trigger),
    index("automation_rules_dept_idx").on(table.departmentId),
    index("automation_rules_active_idx").on(table.isActive),
  ],
);

// Support Analytics
export const supportAnalytics = pgTable(
  "support_analytics",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    date: timestamp("date").notNull(),
    departmentId: uuid("department_id").references(() => supportDepartments.id),
    agentId: uuid("agent_id").references(() => supportAgents.id),
    ticketsCreated: integer("tickets_created").default(0),
    ticketsResolved: integer("tickets_resolved").default(0),
    ticketsClosed: integer("tickets_closed").default(0),
    avgFirstResponseTime: decimal("avg_first_response_time", {
      precision: 10,
      scale: 2,
    }),
    avgResolutionTime: decimal("avg_resolution_time", {
      precision: 10,
      scale: 2,
    }),
    customerSatisfactionAvg: decimal("customer_satisfaction_avg", {
      precision: 3,
      scale: 2,
    }),
    escalatedTickets: integer("escalated_tickets").default(0),
    reopenedTickets: integer("reopened_tickets").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("analytics_date_idx").on(table.date),
    index("analytics_dept_idx").on(table.departmentId),
    index("analytics_agent_idx").on(table.agentId),
  ],
);

// Support Settings
export const supportSettings = pgTable(
  "support_settings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: jsonb("value"),
    category: varchar("category", { length: 50 }).default("general"),
    description: text("description"),
    dataType: varchar("data_type", { length: 20 }).default("string"),
    isPublic: boolean("is_public").default(false),
    updatedBy: varchar("updated_by"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("support_settings_category_idx").on(table.category),
    index("support_settings_public_idx").on(table.isPublic),
  ],
);

// Relations
export const supportDepartmentsRelations = relations(
  supportDepartments,
  ({ many }) => ({
    agents: many(supportAgents),
    tickets: many(supportTickets),
    categories: many(supportCategories),
  }),
);

export const supportAgentsRelations = relations(
  supportAgents,
  ({ one, many }) => ({
    department: one(supportDepartments, {
      fields: [supportAgents.departmentId],
      references: [supportDepartments.id],
    }),
    tickets: many(supportTickets),
    analytics: many(supportAnalytics),
  }),
);

export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    assignedAgent: one(supportAgents, {
      fields: [supportTickets.assignedAgentId],
      references: [supportAgents.id],
    }),
    department: one(supportDepartments, {
      fields: [supportTickets.departmentId],
      references: [supportDepartments.id],
    }),
    category: one(supportCategories, {
      fields: [supportTickets.categoryId],
      references: [supportCategories.id],
    }),
    messages: many(ticketMessages),
  }),
);

export const supportCategoriesRelations = relations(
  supportCategories,
  ({ one, many }) => ({
    parent: one(supportCategories, {
      fields: [supportCategories.parentId],
      references: [supportCategories.id],
    }),
    children: many(supportCategories),
    department: one(supportDepartments, {
      fields: [supportCategories.departmentId],
      references: [supportDepartments.id],
    }),
    tickets: many(supportTickets),
  }),
);

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketMessages.ticketId],
    references: [supportTickets.id],
  }),
}));

export const knowledgeBaseArticlesRelations = relations(
  knowledgeBaseArticles,
  ({ one }) => ({
    category: one(knowledgeBaseCategories, {
      fields: [knowledgeBaseArticles.categoryId],
      references: [knowledgeBaseCategories.id],
    }),
  }),
);

export const knowledgeBaseCategoriesRelations = relations(
  knowledgeBaseCategories,
  ({ one, many }) => ({
    parent: one(knowledgeBaseCategories, {
      fields: [knowledgeBaseCategories.parentId],
      references: [knowledgeBaseCategories.id],
    }),
    children: many(knowledgeBaseCategories),
    articles: many(knowledgeBaseArticles),
  }),
);

// Type exports for the support system
export type SupportDepartment = typeof supportDepartments.$inferSelect;
export type InsertSupportDepartment = typeof supportDepartments.$inferInsert;

export type SupportAgent = typeof supportAgents.$inferSelect;
export type InsertSupportAgent = typeof supportAgents.$inferInsert;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

export type SupportCategory = typeof supportCategories.$inferSelect;
export type InsertSupportCategory = typeof supportCategories.$inferInsert;

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle =
  typeof knowledgeBaseArticles.$inferInsert;

export type KnowledgeBaseCategory = typeof knowledgeBaseCategories.$inferSelect;
export type InsertKnowledgeBaseCategory =
  typeof knowledgeBaseCategories.$inferInsert;

export type CannedResponse = typeof cannedResponses.$inferSelect;
export type InsertCannedResponse = typeof cannedResponses.$inferInsert;

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;

export type SupportAnalytics = typeof supportAnalytics.$inferSelect;
export type InsertSupportAnalytics = typeof supportAnalytics.$inferInsert;

export type SupportSettings = typeof supportSettings.$inferSelect;
export type InsertSupportSettings = typeof supportSettings.$inferInsert;
