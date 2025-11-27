/**
 * FANZ Ecosystem Data Seeding Script
 * Creates realistic mock data for all 15 platforms
 */

import { faker } from '@faker-js/faker';

// ============================================================================
// PLATFORM DEFINITIONS
// ============================================================================

export const PLATFORMS = [
  'boyfanz',
  'girlfanz',
  'pupfanz',
  'gayfanz',
  'bearfanz',
  'cougarfanz',
  'dlbroz',
  'southernfanz',
  'taboofanz',
  'femmefanz',
  'fanzuncut',
  'guyz',
  'transfanz',
] as const;

export type Platform = typeof PLATFORMS[number];

// ============================================================================
// USER GENERATION
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  role: 'creator' | 'fan' | 'admin' | 'moderator';
  platform: Platform;
  verified: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'vip';
  createdAt: Date;
  stats: {
    followers: number;
    following: number;
    posts: number;
    likes: number;
  };
}

export function generateUsers(count: number = 100): User[] {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const platform = faker.helpers.arrayElement(PLATFORMS);
    const role = faker.helpers.weightedArrayElement([
      { weight: 0.3, value: 'creator' },
      { weight: 0.65, value: 'fan' },
      { weight: 0.03, value: 'moderator' },
      { weight: 0.02, value: 'admin' },
    ]) as User['role'];

    users.push({
      id: `user_${faker.string.alphanumeric(16)}`,
      username: faker.internet.userName().toLowerCase(),
      email: faker.internet.email(),
      displayName: faker.person.fullName(),
      bio: faker.lorem.sentences(2),
      avatar: faker.image.avatar(),
      role,
      platform,
      verified: role === 'creator' ? faker.datatype.boolean(0.7) : false,
      subscriptionTier: faker.helpers.arrayElement(['free', 'basic', 'premium', 'vip']),
      createdAt: faker.date.past({ years: 2 }),
      stats: {
        followers: role === 'creator' ? faker.number.int({ min: 100, max: 50000 }) : faker.number.int({ min: 0, max: 500 }),
        following: faker.number.int({ min: 10, max: 1000 }),
        posts: role === 'creator' ? faker.number.int({ min: 50, max: 5000 }) : faker.number.int({ min: 0, max: 100 }),
        likes: faker.number.int({ min: 0, max: 100000 }),
      },
    });
  }

  return users;
}

// ============================================================================
// CONTENT GENERATION
// ============================================================================

export interface Content {
  id: string;
  creatorId: string;
  platform: Platform;
  type: 'post' | 'image' | 'video' | 'livestream' | 'story';
  title: string;
  description: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  price: number;
  isFree: boolean;
  isExclusive: boolean;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
}

export function generateContent(users: User[], count: number = 500): Content[] {
  const content: Content[] = [];
  const creators = users.filter(u => u.role === 'creator');

  for (let i = 0; i < count; i++) {
    const creator = faker.helpers.arrayElement(creators);
    const type = faker.helpers.arrayElement(['post', 'image', 'video', 'livestream', 'story']);
    const isFree = faker.datatype.boolean(0.4);

    content.push({
      id: `content_${faker.string.alphanumeric(16)}`,
      creatorId: creator.id,
      platform: creator.platform,
      type,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      mediaUrl: type !== 'post' ? faker.image.url() : undefined,
      thumbnailUrl: type === 'video' ? faker.image.url() : undefined,
      price: isFree ? 0 : faker.number.float({ min: 4.99, max: 49.99, precision: 0.01 }),
      isFree,
      isExclusive: !isFree && faker.datatype.boolean(0.3),
      tags: faker.helpers.arrayElements(['hot', 'new', 'trending', 'exclusive', 'premium', 'custom'], faker.number.int({ min: 1, max: 4 })),
      likes: faker.number.int({ min: 0, max: 10000 }),
      comments: faker.number.int({ min: 0, max: 500 }),
      views: faker.number.int({ min: 0, max: 50000 }),
      createdAt: faker.date.recent({ days: 30 }),
    });
  }

  return content;
}

// ============================================================================
// SUBSCRIPTION GENERATION
// ============================================================================

export interface Subscription {
  id: string;
  fanId: string;
  creatorId: string;
  platform: Platform;
  tier: 'basic' | 'premium' | 'vip';
  price: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
}

export function generateSubscriptions(users: User[], count: number = 300): Subscription[] {
  const subscriptions: Subscription[] = [];
  const fans = users.filter(u => u.role === 'fan');
  const creators = users.filter(u => u.role === 'creator');

  for (let i = 0; i < count; i++) {
    const fan = faker.helpers.arrayElement(fans);
    const creator = faker.helpers.arrayElement(creators);
    const tier = faker.helpers.arrayElement(['basic', 'premium', 'vip']);
    const startDate = faker.date.past({ years: 1 });

    const prices: Record<string, number> = {
      basic: 9.99,
      premium: 19.99,
      vip: 49.99,
    };

    subscriptions.push({
      id: `sub_${faker.string.alphanumeric(16)}`,
      fanId: fan.id,
      creatorId: creator.id,
      platform: creator.platform,
      tier,
      price: prices[tier],
      status: faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'active' },
        { weight: 0.15, value: 'cancelled' },
        { weight: 0.1, value: 'expired' },
        { weight: 0.05, value: 'pending' },
      ]) as Subscription['status'],
      startDate,
      nextBillingDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: faker.datatype.boolean(0.8),
    });
  }

  return subscriptions;
}

// ============================================================================
// TRANSACTION GENERATION
// ============================================================================

export interface Transaction {
  id: string;
  userId: string;
  type: 'subscription' | 'tip' | 'content_purchase' | 'custom_request' | 'payout';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  processor: string;
  description: string;
  createdAt: Date;
}

export function generateTransactions(users: User[], count: number = 1000): Transaction[] {
  const transactions: Transaction[] = [];
  const processors = ['ccbill', 'segpay', 'epoch', 'paxum', 'coinbase', 'stripe'];

  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(['subscription', 'tip', 'content_purchase', 'custom_request', 'payout']);

    transactions.push({
      id: `txn_${faker.string.alphanumeric(16)}`,
      userId: user.id,
      type,
      amount: faker.number.float({ min: 5, max: 500, precision: 0.01 }),
      currency: 'USD',
      status: faker.helpers.weightedArrayElement([
        { weight: 0.85, value: 'completed' },
        { weight: 0.08, value: 'pending' },
        { weight: 0.05, value: 'failed' },
        { weight: 0.02, value: 'refunded' },
      ]) as Transaction['status'],
      processor: faker.helpers.arrayElement(processors),
      description: `${type.replace('_', ' ')} payment`,
      createdAt: faker.date.recent({ days: 90 }),
    });
  }

  return transactions;
}

// ============================================================================
// HR DATA GENERATION
// ============================================================================

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'on_leave' | 'terminated';
  hireDate: Date;
  salary: number;
  payFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annual';
  location: string;
}

export function generateEmployees(count: number = 50): Employee[] {
  const employees: Employee[] = [];
  const departments = ['Engineering', 'Content Moderation', 'Customer Support', 'Marketing', 'Legal', 'Finance', 'HR', 'Operations'];
  const positions = ['Manager', 'Senior', 'Lead', 'Associate', 'Junior', 'Specialist', 'Coordinator'];

  for (let i = 0; i < count; i++) {
    const department = faker.helpers.arrayElement(departments);
    const position = faker.helpers.arrayElement(positions);

    employees.push({
      id: `emp_${faker.string.alphanumeric(16)}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      department,
      position: `${position} ${department} ${faker.person.jobType()}`,
      role: faker.person.jobTitle(),
      employmentType: faker.helpers.arrayElement(['full_time', 'part_time', 'contract', 'intern']),
      status: faker.helpers.weightedArrayElement([
        { weight: 0.9, value: 'active' },
        { weight: 0.08, value: 'on_leave' },
        { weight: 0.02, value: 'terminated' },
      ]) as Employee['status'],
      hireDate: faker.date.past({ years: 5 }),
      salary: faker.number.int({ min: 40000, max: 200000 }),
      payFrequency: faker.helpers.arrayElement(['hourly', 'biweekly', 'monthly', 'annual']),
      location: faker.location.city() + ', ' + faker.location.state(),
    });
  }

  return employees;
}

export interface ADARequest {
  id: string;
  employeeId: string;
  employeeName: string;
  disabilityType: string;
  accommodationDescription: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: Date;
  medicalDocumentationRequired: boolean;
  medicalDocumentationSubmitted: boolean;
  interactiveProcessStarted: boolean;
}

export function generateADARequests(employees: Employee[], count: number = 20): ADARequest[] {
  const requests: ADARequest[] = [];
  const disabilityTypes = ['Visual', 'Hearing', 'Mobility', 'Cognitive', 'Mental Health', 'Chronic Illness'];

  for (let i = 0; i < count; i++) {
    const employee = faker.helpers.arrayElement(employees);

    requests.push({
      id: `ada_${faker.string.alphanumeric(16)}`,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      disabilityType: faker.helpers.arrayElement(disabilityTypes),
      accommodationDescription: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['pending', 'under_review', 'approved', 'denied', 'implemented']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      submittedDate: faker.date.recent({ days: 60 }),
      medicalDocumentationRequired: faker.datatype.boolean(0.7),
      medicalDocumentationSubmitted: faker.datatype.boolean(0.5),
      interactiveProcessStarted: faker.datatype.boolean(0.6),
    });
  }

  return requests;
}

export interface ComplianceRecord {
  id: string;
  requirementId: string;
  requirementName: string;
  category: 'federal' | 'state' | 'international' | 'industry';
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  lastAuditDate: Date;
  nextAuditDate: Date;
  assignedTo: string;
}

export function generateComplianceRecords(count: number = 50): ComplianceRecord[] {
  const records: ComplianceRecord[] = [];
  const requirements = [
    'USC 2257 Record Keeping',
    'GDPR Data Privacy',
    'CCPA Consumer Privacy',
    'ADA Title I Employment',
    'OSHA Workplace Safety',
    'FLSA Wage and Hour',
    'HIPAA Health Privacy',
    'SOX Financial Reporting',
  ];

  for (let i = 0; i < count; i++) {
    const lastAudit = faker.date.past({ years: 1 });

    records.push({
      id: `comp_${faker.string.alphanumeric(16)}`,
      requirementId: `req_${faker.number.int({ min: 1, max: 50 })}`,
      requirementName: faker.helpers.arrayElement(requirements),
      category: faker.helpers.arrayElement(['federal', 'state', 'international', 'industry']),
      status: faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'compliant' },
        { weight: 0.2, value: 'warning' },
        { weight: 0.08, value: 'pending' },
        { weight: 0.02, value: 'violation' },
      ]) as ComplianceRecord['status'],
      lastAuditDate: lastAudit,
      nextAuditDate: new Date(lastAudit.getTime() + 90 * 24 * 60 * 60 * 1000),
      assignedTo: faker.person.fullName(),
    });
  }

  return records;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

export interface SeedData {
  users: User[];
  content: Content[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  employees: Employee[];
  adaRequests: ADARequest[];
  complianceRecords: ComplianceRecord[];
}

export function generateAllSeedData(): SeedData {
  console.log('🌱 Generating seed data...');

  const users = generateUsers(200);
  console.log(`✅ Generated ${users.length} users`);

  const content = generateContent(users, 1000);
  console.log(`✅ Generated ${content.length} content items`);

  const subscriptions = generateSubscriptions(users, 500);
  console.log(`✅ Generated ${subscriptions.length} subscriptions`);

  const transactions = generateTransactions(users, 2000);
  console.log(`✅ Generated ${transactions.length} transactions`);

  const employees = generateEmployees(75);
  console.log(`✅ Generated ${employees.length} employees`);

  const adaRequests = generateADARequests(employees, 30);
  console.log(`✅ Generated ${adaRequests.length} ADA requests`);

  const complianceRecords = generateComplianceRecords(50);
  console.log(`✅ Generated ${complianceRecords.length} compliance records`);

  return {
    users,
    content,
    subscriptions,
    transactions,
    employees,
    adaRequests,
    complianceRecords,
  };
}

// ============================================================================
// EXPORT SEED DATA TO JSON
// ============================================================================

export function exportSeedDataToJSON(data: SeedData, outputPath: string = './seed-data.json'): void {
  const fs = require('fs');
  const path = require('path');

  const fullPath = path.resolve(outputPath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));

  console.log(`\n📦 Seed data exported to: ${fullPath}`);
  console.log(`\n📊 Data Summary:`);
  console.log(`   Users: ${data.users.length}`);
  console.log(`   Content: ${data.content.length}`);
  console.log(`   Subscriptions: ${data.subscriptions.length}`);
  console.log(`   Transactions: ${data.transactions.length}`);
  console.log(`   Employees: ${data.employees.length}`);
  console.log(`   ADA Requests: ${data.adaRequests.length}`);
  console.log(`   Compliance Records: ${data.complianceRecords.length}`);
}

// Run if executed directly
if (require.main === module) {
  const seedData = generateAllSeedData();
  exportSeedDataToJSON(seedData, './server/seed/seed-data.json');
}
