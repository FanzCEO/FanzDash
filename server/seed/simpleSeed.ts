/**
 * Simple Seed Data Generator (No External Dependencies)
 * Creates realistic mock data for FANZ ecosystem without @faker-js/faker
 */

// ============================================================================
// UTILITIES
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(daysAgo: number): Date {
  const now = new Date();
  return new Date(now.getTime() - randomInt(0, daysAgo) * 24 * 60 * 60 * 1000);
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}${randomInt(1000, 9999)}`;
}

// ============================================================================
// DATA POOLS
// ============================================================================

const PLATFORMS = [
  'boyfanz', 'girlfanz', 'pupfanz', 'gayfanz', 'bearfanz',
  'cougarfanz', 'dlbroz', 'southernfanz', 'taboofanz',
  'femmefanz', 'fanzuncut', 'guyz', 'transfanz'
];

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn',
  'Skyler', 'Avery', 'Dakota', 'Phoenix', 'Sage', 'River', 'Blake', 'Devon',
  'Cameron', 'Kendall', 'Logan', 'Parker', 'Reese', 'Rowan', 'Sam', 'Drew'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
];

const DEPARTMENTS = [
  'Engineering', 'Content Moderation', 'Customer Support', 'Marketing',
  'Legal', 'Finance', 'HR', 'Operations', 'Product', 'Sales'
];

const POSITIONS = [
  'Manager', 'Senior', 'Lead', 'Associate', 'Junior', 'Specialist', 'Coordinator', 'Director'
];

const DISABILITY_TYPES = [
  'Visual', 'Hearing', 'Mobility', 'Cognitive', 'Mental Health', 'Chronic Illness'
];

const CONTENT_TITLES = [
  'Behind the Scenes', 'Exclusive Content', 'Special Request', 'Live Session Recap',
  'Q&A Session', 'New Release', 'Premium Preview', 'VIP Access', 'Fan Favorite',
  'Limited Edition', 'Monthly Special', 'Subscriber Exclusive'
];

const TAGS = [
  'hot', 'new', 'trending', 'exclusive', 'premium', 'custom', 'featured', 'popular'
];

// ============================================================================
// GENERATORS
// ============================================================================

export function generateSimpleUsers(count: number = 100) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(100, 999)}`;
    const role = randomElement(['creator', 'creator', 'creator', 'fan', 'fan', 'fan', 'fan', 'fan', 'moderator', 'admin']);

    users.push({
      id: generateId('user'),
      username,
      email: `${username}@example.com`,
      displayName: `${firstName} ${lastName}`,
      bio: `Content creator on ${randomElement(PLATFORMS)}. Sharing exclusive content.`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role,
      platform: randomElement(PLATFORMS),
      verified: role === 'creator' && Math.random() > 0.3,
      subscriptionTier: randomElement(['free', 'basic', 'premium', 'vip']),
      createdAt: randomDate(730).toISOString(),
      stats: {
        followers: role === 'creator' ? randomInt(100, 50000) : randomInt(0, 500),
        following: randomInt(10, 1000),
        posts: role === 'creator' ? randomInt(50, 5000) : randomInt(0, 100),
        likes: randomInt(0, 100000)
      }
    });
  }

  return users;
}

export function generateSimpleContent(users: any[], count: number = 500) {
  const content = [];
  const creators = users.filter(u => u.role === 'creator');

  for (let i = 0; i < count; i++) {
    const creator = randomElement(creators);
    const type = randomElement(['post', 'image', 'video', 'livestream', 'story']);
    const isFree = Math.random() > 0.6;

    content.push({
      id: generateId('content'),
      creatorId: creator.id,
      platform: creator.platform,
      type,
      title: randomElement(CONTENT_TITLES),
      description: 'Exclusive content for my subscribers. Check out this amazing content!',
      mediaUrl: type !== 'post' ? `https://picsum.photos/800/600?random=${i}` : undefined,
      thumbnailUrl: type === 'video' ? `https://picsum.photos/400/300?random=${i}` : undefined,
      price: isFree ? 0 : randomFloat(4.99, 49.99),
      isFree,
      isExclusive: !isFree && Math.random() > 0.7,
      tags: randomElements(TAGS, randomInt(1, 4)),
      likes: randomInt(0, 10000),
      comments: randomInt(0, 500),
      views: randomInt(0, 50000),
      createdAt: randomDate(30).toISOString()
    });
  }

  return content;
}

export function generateSimpleSubscriptions(users: any[], count: number = 300) {
  const subscriptions = [];
  const fans = users.filter(u => u.role === 'fan');
  const creators = users.filter(u => u.role === 'creator');

  const prices: Record<string, number> = {
    basic: 9.99,
    premium: 19.99,
    vip: 49.99
  };

  for (let i = 0; i < count; i++) {
    const fan = randomElement(fans);
    const creator = randomElement(creators);
    const tier = randomElement(['basic', 'premium', 'vip']);
    const startDate = randomDate(365);

    subscriptions.push({
      id: generateId('sub'),
      fanId: fan.id,
      creatorId: creator.id,
      platform: creator.platform,
      tier,
      price: prices[tier],
      status: randomElement(['active', 'active', 'active', 'active', 'cancelled', 'expired', 'pending']),
      startDate: startDate.toISOString(),
      nextBillingDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: Math.random() > 0.2
    });
  }

  return subscriptions;
}

export function generateSimpleTransactions(users: any[], count: number = 1000) {
  const transactions = [];
  const processors = ['ccbill', 'segpay', 'epoch', 'paxum', 'coinbase', 'stripe', 'vendo', 'nowpayments'];

  for (let i = 0; i < count; i++) {
    const user = randomElement(users);
    const type = randomElement(['subscription', 'tip', 'content_purchase', 'custom_request', 'payout']);

    transactions.push({
      id: generateId('txn'),
      userId: user.id,
      type,
      amount: randomFloat(5, 500),
      currency: 'USD',
      status: randomElement(['completed', 'completed', 'completed', 'completed', 'pending', 'failed', 'refunded']),
      processor: randomElement(processors),
      description: `${type.replace('_', ' ')} payment`,
      createdAt: randomDate(90).toISOString()
    });
  }

  return transactions;
}

export function generateSimpleEmployees(count: number = 50) {
  const employees = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const department = randomElement(DEPARTMENTS);
    const position = randomElement(POSITIONS);

    employees.push({
      id: generateId('emp'),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fanz.com`,
      phone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      department,
      position: `${position} ${department} Specialist`,
      role: `${position} ${department}`,
      employmentType: randomElement(['full_time', 'full_time', 'full_time', 'part_time', 'contract', 'intern']),
      status: randomElement(['active', 'active', 'active', 'active', 'active', 'on_leave', 'terminated']),
      hireDate: randomDate(1825).toISOString(),
      salary: randomInt(40000, 200000),
      payFrequency: randomElement(['biweekly', 'monthly', 'annual']),
      location: randomElement(['Remote', 'New York, NY', 'Los Angeles, CA', 'Austin, TX', 'Miami, FL'])
    });
  }

  return employees;
}

export function generateSimpleADARequests(employees: any[], count: number = 20) {
  const requests = [];

  for (let i = 0; i < count; i++) {
    const employee = randomElement(employees);

    requests.push({
      id: generateId('ada'),
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      disabilityType: randomElement(DISABILITY_TYPES),
      accommodationDescription: 'Request for reasonable accommodation to perform essential job functions.',
      status: randomElement(['pending', 'under_review', 'approved', 'denied', 'implemented']),
      priority: randomElement(['low', 'medium', 'high', 'urgent']),
      submittedDate: randomDate(60).toISOString(),
      medicalDocumentationRequired: Math.random() > 0.3,
      medicalDocumentationSubmitted: Math.random() > 0.5,
      interactiveProcessStarted: Math.random() > 0.4
    });
  }

  return requests;
}

export function generateSimpleComplianceRecords(count: number = 50) {
  const records = [];
  const requirements = [
    'USC 2257 Record Keeping',
    'GDPR Data Privacy',
    'CCPA Consumer Privacy',
    'ADA Title I Employment',
    'OSHA Workplace Safety',
    'FLSA Wage and Hour',
    'HIPAA Health Privacy',
    'SOX Financial Reporting',
    'PCI DSS Compliance',
    'COPPA Child Protection'
  ];

  for (let i = 0; i < count; i++) {
    const lastAudit = randomDate(365);

    records.push({
      id: generateId('comp'),
      requirementId: `req_${randomInt(1, 50)}`,
      requirementName: randomElement(requirements),
      category: randomElement(['federal', 'state', 'international', 'industry']),
      status: randomElement(['compliant', 'compliant', 'compliant', 'warning', 'pending', 'violation']),
      lastAuditDate: lastAudit.toISOString(),
      nextAuditDate: new Date(lastAudit.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`
    });
  }

  return records;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function generateAllSimpleSeedData() {
  console.log('🌱 Generating simple seed data...\n');

  const users = generateSimpleUsers(200);
  console.log(`✅ Generated ${users.length} users`);

  const content = generateSimpleContent(users, 1000);
  console.log(`✅ Generated ${content.length} content items`);

  const subscriptions = generateSimpleSubscriptions(users, 500);
  console.log(`✅ Generated ${subscriptions.length} subscriptions`);

  const transactions = generateSimpleTransactions(users, 2000);
  console.log(`✅ Generated ${transactions.length} transactions`);

  const employees = generateSimpleEmployees(75);
  console.log(`✅ Generated ${employees.length} employees`);

  const adaRequests = generateSimpleADARequests(employees, 30);
  console.log(`✅ Generated ${adaRequests.length} ADA requests`);

  const complianceRecords = generateSimpleComplianceRecords(50);
  console.log(`✅ Generated ${complianceRecords.length} compliance records`);

  return {
    users,
    content,
    subscriptions,
    transactions,
    employees,
    adaRequests,
    complianceRecords,
    meta: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      platform: 'FANZ Ecosystem'
    }
  };
}

// Export to JSON file
export async function exportToJSON(outputPath: string = './server/seed/seed-data.json') {
  const fs = await import('fs');
  const path = await import('path');

  const data = generateAllSimpleSeedData();
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
  console.log(`\n✅ Seed data generation complete!`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportToJSON();
}
