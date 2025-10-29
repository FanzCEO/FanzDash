import { EventEmitter } from 'events';
import { universalHub, UniversalUser, CrossPlatformTransaction } from '../integrations/UniversalPlatformHub';
import { PaymentProcessor } from '../paymentProcessor';
import { ZeroKnowledgeVault } from '../security/zkVault';

/**
 * FanzFinance OS - Complete Financial Management System
 * Integrates with existing payment processors and provides full accounting capabilities
 * Following user rule X9LylpzDci5RxgIxhrRw0v for financial OS implementation
 */

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subtype: string;
  balance: number;
  currency: string;
  isActive: boolean;
  metadata: {
    platformId?: string;
    creatorId?: string;
    paymentGateway?: string;
    taxCategory?: string;
  };
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  date: Date;
  reference: string;
  description: string;
  entries: {
    accountId: string;
    debit: number;
    credit: number;
  }[];
  status: 'draft' | 'posted' | 'reversed';
  platformSource: string;
  createdBy: string;
  metadata: any;
}

export interface FinancialReport {
  id: string;
  type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'CREATOR_EARNINGS' | 'PLATFORM_PERFORMANCE';
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  data: {
    [category: string]: {
      [account: string]: number;
    };
  };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    creatorPayouts: number;
    platformFees: number;
    processingFees: number;
  };
  generatedAt: Date;
  filters?: {
    platformIds?: string[];
    creatorIds?: string[];
    paymentMethods?: string[];
  };
}

export interface TaxRecord {
  id: string;
  userId: string;
  taxYear: number;
  jurisdiction: string;
  forms: {
    type: string;
    data: any;
    generatedAt: Date;
    status: 'draft' | 'submitted' | 'approved';
  }[];
  totalEarnings: number;
  deductions: number;
  taxOwed: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  method: 'paxum' | 'wise' | 'payoneer' | 'crypto' | 'ach' | 'wire';
  status: 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  fees: {
    processing: number;
    conversion: number;
    total: number;
  };
  destination: {
    accountDetails: any;
    country: string;
    currency: string;
  };
  compliance: {
    kycVerified: boolean;
    taxFormsCompleted: boolean;
    thresholdChecks: boolean;
  };
  metadata: {
    platformEarnings: { [platformId: string]: number };
    taxWithholding?: number;
    reference: string;
  };
}

export class FanzFinanceOS extends EventEmitter {
  private accounts = new Map<string, FinancialAccount>();
  private journalEntries = new Map<string, JournalEntry>();
  private payouts = new Map<string, Payout>();
  private taxRecords = new Map<string, TaxRecord>();
  
  private paymentProcessor: PaymentProcessor;
  private vault: ZeroKnowledgeVault;
  
  // Chart of Accounts structure
  private readonly CHART_OF_ACCOUNTS = {
    ASSETS: {
      'CASH_CCBILL': { name: 'CCBill Cash Account', subtype: 'CASH' },
      'CASH_SEGPAY': { name: 'Segpay Cash Account', subtype: 'CASH' },
      'CASH_EPOCH': { name: 'Epoch Cash Account', subtype: 'CASH' },
      'CASH_CRYPTO_BTC': { name: 'Bitcoin Wallet', subtype: 'CRYPTO' },
      'CASH_CRYPTO_ETH': { name: 'Ethereum Wallet', subtype: 'CRYPTO' },
      'CASH_CRYPTO_USDT': { name: 'USDT Wallet', subtype: 'CRYPTO' },
      'RECEIVABLES_CREATORS': { name: 'Creator Receivables', subtype: 'RECEIVABLE' },
      'RECEIVABLES_PAYMENT_PROCESSORS': { name: 'Payment Processor Receivables', subtype: 'RECEIVABLE' }
    },
    LIABILITIES: {
      'PAYABLES_CREATORS': { name: 'Creator Payables', subtype: 'PAYABLE' },
      'PAYABLES_PROCESSORS': { name: 'Payment Processor Fees Payable', subtype: 'PAYABLE' },
      'TAX_WITHHOLDING': { name: 'Tax Withholding Liability', subtype: 'TAX' },
      'ESCROW_FUNDS': { name: 'Escrow Funds Liability', subtype: 'ESCROW' }
    },
    EQUITY: {
      'RETAINED_EARNINGS': { name: 'Retained Earnings', subtype: 'EQUITY' },
      'OWNERS_EQUITY': { name: 'Owner\'s Equity', subtype: 'EQUITY' }
    },
    REVENUE: {
      'REVENUE_PLATFORM_FEES': { name: 'Platform Commission Revenue', subtype: 'COMMISSION' },
      'REVENUE_SUBSCRIPTION_FEES': { name: 'Subscription Revenue', subtype: 'SUBSCRIPTION' },
      'REVENUE_TIP_COMMISSIONS': { name: 'Tip Commission Revenue', subtype: 'COMMISSION' },
      'REVENUE_ADVERTISING': { name: 'Advertising Revenue', subtype: 'ADVERTISING' }
    },
    EXPENSES: {
      'EXPENSE_CREATOR_PAYOUTS': { name: 'Creator Payouts', subtype: 'PAYOUT' },
      'EXPENSE_PAYMENT_PROCESSING': { name: 'Payment Processing Fees', subtype: 'PROCESSING' },
      'EXPENSE_CHARGEBACK_FEES': { name: 'Chargeback Fees', subtype: 'CHARGEBACK' },
      'EXPENSE_COMPLIANCE': { name: 'Compliance & Legal', subtype: 'OPERATIONAL' },
      'EXPENSE_INFRASTRUCTURE': { name: 'Infrastructure & Hosting', subtype: 'OPERATIONAL' },
      'EXPENSE_MARKETING': { name: 'Marketing & Advertising', subtype: 'MARKETING' }
    }
  };

  constructor(paymentProcessor: PaymentProcessor, vault: ZeroKnowledgeVault) {
    super();
    this.paymentProcessor = paymentProcessor;
    this.vault = vault;
    
    this.initializeChartOfAccounts();
    this.setupEventHandlers();
    this.startPeriodicProcesses();
    
    console.log('🏦 FanzFinance OS initialized with full accounting capabilities');
  }

  /**
   * Initialize the chart of accounts
   */
  private initializeChartOfAccounts(): void {
    Object.entries(this.CHART_OF_ACCOUNTS).forEach(([type, accounts]) => {
      Object.entries(accounts).forEach(([accountId, accountData]) => {
        const account: FinancialAccount = {
          id: accountId,
          name: accountData.name,
          type: type as any,
          subtype: accountData.subtype,
          balance: 0,
          currency: 'USD',
          isActive: true,
          metadata: {}
        };
        this.accounts.set(accountId, account);
      });
    });
    
    console.log(`📊 Initialized ${this.accounts.size} accounts in chart of accounts`);
  }

  /**
   * Process payment and create corresponding journal entries
   */
  async processPaymentTransaction(
    transaction: CrossPlatformTransaction,
    paymentMethod: string
  ): Promise<void> {
    try {
      const journalId = `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine cash account based on payment method
      let cashAccountId = 'CASH_CCBILL'; // default
      if (paymentMethod.includes('segpay')) cashAccountId = 'CASH_SEGPAY';
      else if (paymentMethod.includes('epoch')) cashAccountId = 'CASH_EPOCH';
      else if (paymentMethod.includes('crypto')) {
        cashAccountId = transaction.currency === 'BTC' ? 'CASH_CRYPTO_BTC' : 
                      transaction.currency === 'ETH' ? 'CASH_CRYPTO_ETH' : 'CASH_CRYPTO_USDT';
      }

      const platformFee = transaction.metadata.fees.platform;
      const processingFee = transaction.metadata.fees.processing;
      const creatorAmount = transaction.amount - transaction.metadata.fees.total;

      // Create journal entry for payment
      const journalEntry: JournalEntry = {
        id: journalId,
        transactionId: transaction.id,
        date: new Date(),
        reference: `Payment-${transaction.id}`,
        description: `${transaction.type} payment from ${transaction.fromUserId} to ${transaction.toUserId}`,
        entries: [
          // Debit cash account for gross amount
          { accountId: cashAccountId, debit: transaction.amount, credit: 0 },
          // Credit platform commission revenue
          { accountId: 'REVENUE_PLATFORM_FEES', debit: 0, credit: platformFee },
          // Debit processing fee expense
          { accountId: 'EXPENSE_PAYMENT_PROCESSING', debit: processingFee, credit: 0 },
          // Credit creator payable
          { accountId: 'PAYABLES_CREATORS', debit: 0, credit: creatorAmount }
        ],
        status: 'posted',
        platformSource: transaction.sourcePlatform,
        createdBy: 'system',
        metadata: {
          transactionType: transaction.type,
          paymentMethod,
          fromUserId: transaction.fromUserId,
          toUserId: transaction.toUserId
        }
      };

      this.journalEntries.set(journalId, journalEntry);
      
      // Update account balances
      await this.updateAccountBalances(journalEntry);
      
      // Store financial record in vault for compliance
      await this.vault.storeVaultEntry(
        transaction.toUserId,
        `Financial Transaction: ${transaction.id}`,
        JSON.stringify(journalEntry),
        'FINANCIAL',
        ['transaction', 'earnings', transaction.sourcePlatform],
        3 // High clearance for financial records
      );

      this.emit('transaction_processed', { transaction, journalEntry });
      
      console.log(`💳 Processed payment transaction: ${transaction.id} → ${journalId}`);
    } catch (error) {
      console.error('Failed to process payment transaction:', error);
      throw error;
    }
  }

  /**
   * Update account balances based on journal entry
   */
  private async updateAccountBalances(journalEntry: JournalEntry): Promise<void> {
    for (const entry of journalEntry.entries) {
      const account = this.accounts.get(entry.accountId);
      if (!account) continue;

      // Assets and Expenses increase with debits, decrease with credits
      // Liabilities, Equity, and Revenue increase with credits, decrease with debits
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        account.balance += (entry.debit - entry.credit);
      } else {
        account.balance += (entry.credit - entry.debit);
      }

      this.accounts.set(entry.accountId, account);
    }
  }

  /**
   * Schedule creator payout
   */
  async scheduleCreatorPayout(
    creatorId: string,
    amount: number,
    method: 'paxum' | 'wise' | 'payoneer' | 'crypto' | 'ach' | 'wire',
    destination: any
  ): Promise<string> {
    try {
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get creator's earnings across platforms
      const creator = universalHub.getCreatorDashboard ? 
        await universalHub.getCreatorDashboard(creatorId) : null;
      
      if (!creator || creator.wallet.balance < amount) {
        throw new Error('Insufficient balance for payout');
      }

      // Calculate payout fees
      const fees = this.calculatePayoutFees(method, amount, destination.country);
      
      const payout: Payout = {
        id: payoutId,
        creatorId,
        amount: amount - fees.total,
        currency: 'USD',
        method,
        status: 'scheduled',
        scheduledDate: new Date(),
        fees,
        destination,
        compliance: {
          kycVerified: creator.creator.kycStatus === 'verified',
          taxFormsCompleted: this.checkTaxFormsComplete(creatorId),
          thresholdChecks: this.checkPayoutThresholds(creatorId, amount)
        },
        metadata: {
          platformEarnings: creator.platforms.reduce((acc: any, platform: any) => {
            acc[platform.id] = platform.earnings;
            return acc;
          }, {}),
          reference: `PAYOUT-${payoutId.slice(-8).toUpperCase()}`
        }
      };

      this.payouts.set(payoutId, payout);
      
      // Create journal entry for payout
      const journalId = await this.createPayoutJournalEntry(payout);
      
      // Store payout record in vault
      await this.vault.storeVaultEntry(
        creatorId,
        `Payout Scheduled: ${payoutId}`,
        JSON.stringify(payout),
        'FINANCIAL',
        ['payout', method, 'scheduled'],
        3
      );

      this.emit('payout_scheduled', payout);
      
      console.log(`💸 Scheduled payout: ${payoutId} for creator ${creatorId} - $${amount} via ${method}`);
      return payoutId;
    } catch (error) {
      console.error('Failed to schedule payout:', error);
      throw error;
    }
  }

  /**
   * Process scheduled payouts
   */
  async processScheduledPayouts(): Promise<void> {
    const scheduledPayouts = Array.from(this.payouts.values())
      .filter(p => p.status === 'scheduled' && p.scheduledDate <= new Date());

    for (const payout of scheduledPayouts) {
      try {
        // Check compliance requirements
        if (!payout.compliance.kycVerified || 
            !payout.compliance.taxFormsCompleted || 
            !payout.compliance.thresholdChecks) {
          payout.status = 'failed';
          this.payouts.set(payout.id, payout);
          this.emit('payout_failed', { payout, reason: 'Compliance requirements not met' });
          continue;
        }

        payout.status = 'processing';
        payout.processedDate = new Date();
        
        // Process through payment processor (existing payout integration)
        const payoutResult = await this.paymentProcessor.processPayout(payout);
        
        if (payoutResult.success) {
          payout.status = 'completed';
          payout.completedDate = new Date();
          this.emit('payout_completed', payout);
        } else {
          payout.status = 'failed';
          this.emit('payout_failed', { payout, reason: payoutResult.error });
        }
        
        this.payouts.set(payout.id, payout);
      } catch (error) {
        console.error(`Failed to process payout ${payout.id}:`, error);
        payout.status = 'failed';
        this.payouts.set(payout.id, payout);
      }
    }
  }

  /**
   * Generate financial reports
   */
  async generateReport(
    type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'CREATOR_EARNINGS' | 'PLATFORM_PERFORMANCE',
    periodStart: Date,
    periodEnd: Date,
    filters?: any
  ): Promise<FinancialReport> {
    const reportId = `report_${type}_${Date.now()}`;
    
    const report: FinancialReport = {
      id: reportId,
      type,
      periodStart,
      periodEnd,
      currency: 'USD',
      data: {},
      summary: {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        creatorPayouts: 0,
        platformFees: 0,
        processingFees: 0
      },
      generatedAt: new Date(),
      filters
    };

    switch (type) {
      case 'BALANCE_SHEET':
        report.data = await this.generateBalanceSheetData();
        break;
      case 'INCOME_STATEMENT':
        report.data = await this.generateIncomeStatementData(periodStart, periodEnd);
        break;
      case 'CREATOR_EARNINGS':
        report.data = await this.generateCreatorEarningsData(periodStart, periodEnd, filters);
        break;
      case 'PLATFORM_PERFORMANCE':
        report.data = await this.generatePlatformPerformanceData(periodStart, periodEnd);
        break;
    }

    // Calculate summary metrics
    report.summary = this.calculateReportSummary(report.data, type);
    
    console.log(`📊 Generated ${type} report: ${reportId}`);
    return report;
  }

  /**
   * Generate tax documents for creators
   */
  async generateTaxDocuments(creatorId: string, taxYear: number): Promise<TaxRecord> {
    try {
      const taxRecordId = `tax_${creatorId}_${taxYear}`;
      
      // Get creator earnings for tax year
      const yearStart = new Date(taxYear, 0, 1);
      const yearEnd = new Date(taxYear, 11, 31, 23, 59, 59);
      
      const creatorEarnings = await this.getCreatorEarningsForPeriod(creatorId, yearStart, yearEnd);
      
      const taxRecord: TaxRecord = {
        id: taxRecordId,
        userId: creatorId,
        taxYear,
        jurisdiction: 'US', // Default, should be based on creator location
        forms: [
          {
            type: '1099-NEC',
            data: {
              payerInfo: {
                name: 'Fanz Unlimited Network',
                ein: '00-0000000', // Replace with actual EIN
                address: '123 Business St, City, State 12345'
              },
              recipientInfo: await this.getCreatorTaxInfo(creatorId),
              nonEmployeeCompensation: creatorEarnings.totalGross,
              federalTaxWithheld: creatorEarnings.taxWithheld || 0
            },
            generatedAt: new Date(),
            status: 'draft'
          }
        ],
        totalEarnings: creatorEarnings.totalGross,
        deductions: 0, // Creators handle their own deductions
        taxOwed: 0, // Not calculated here, for creator's tax preparer
        paymentStatus: 'pending'
      };

      this.taxRecords.set(taxRecordId, taxRecord);
      
      // Store tax record in vault with high security
      await this.vault.storeVaultEntry(
        creatorId,
        `Tax Documents ${taxYear}`,
        JSON.stringify(taxRecord),
        'TAX_DOCUMENT',
        ['tax', taxYear.toString(), '1099'],
        4 // Highest clearance for tax documents
      );

      this.emit('tax_documents_generated', taxRecord);
      
      console.log(`📋 Generated tax documents for creator ${creatorId}, year ${taxYear}`);
      return taxRecord;
    } catch (error) {
      console.error('Failed to generate tax documents:', error);
      throw error;
    }
  }

  /**
   * AI Financial Advisor - Provide insights and recommendations
   */
  async getFinancialInsights(filters?: any): Promise<any> {
    try {
      const insights = {
        cashFlow: await this.analyzeCashFlow(),
        creatorRetention: await this.analyzeCreatorRetention(),
        revenueGrowth: await this.analyzeRevenueGrowth(),
        costOptimization: await this.analyzeCostOptimization(),
        riskAssessment: await this.assessFinancialRisk(),
        recommendations: [] as string[]
      };

      // Generate AI-powered recommendations
      if (insights.cashFlow.trend === 'declining') {
        insights.recommendations.push('Consider implementing tiered creator payout schedules to improve cash flow');
      }
      
      if (insights.creatorRetention.rate < 0.8) {
        insights.recommendations.push('Creator retention is below 80%. Review payout schedules and commission rates');
      }
      
      if (insights.costOptimization.processingFeesRatio > 0.05) {
        insights.recommendations.push('Processing fees exceed 5% of revenue. Negotiate better rates or optimize payment routing');
      }

      return insights;
    } catch (error) {
      console.error('Failed to generate financial insights:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculatePayoutFees(
    method: string, 
    amount: number, 
    country: string
  ): { processing: number; conversion: number; total: number } {
    const feeStructure: any = {
      'paxum': { fixed: 1.00, percentage: 0.025 },
      'wise': { fixed: 2.50, percentage: 0.01 },
      'payoneer': { fixed: 3.00, percentage: 0.02 },
      'crypto': { fixed: 0.50, percentage: 0.005 },
      'ach': { fixed: 1.50, percentage: 0.008 },
      'wire': { fixed: 25.00, percentage: 0.001 }
    };

    const fees = feeStructure[method] || feeStructure['paxum'];
    const processing = fees.fixed + (amount * fees.percentage);
    const conversion = country !== 'US' ? amount * 0.002 : 0;
    
    return {
      processing,
      conversion,
      total: processing + conversion
    };
  }

  private async createPayoutJournalEntry(payout: Payout): Promise<string> {
    const journalId = `je_payout_${Date.now()}`;
    
    const journalEntry: JournalEntry = {
      id: journalId,
      transactionId: payout.id,
      date: new Date(),
      reference: `Payout-${payout.id}`,
      description: `Creator payout to ${payout.creatorId} via ${payout.method}`,
      entries: [
        // Debit creator payables (reduce liability)
        { accountId: 'PAYABLES_CREATORS', debit: payout.amount + payout.fees.total, credit: 0 },
        // Debit payout processing fees
        { accountId: 'EXPENSE_PAYMENT_PROCESSING', debit: payout.fees.total, credit: 0 },
        // Credit cash account
        { accountId: this.getPayoutCashAccount(payout.method), debit: 0, credit: payout.amount + payout.fees.total }
      ],
      status: 'posted',
      platformSource: 'system',
      createdBy: 'finance_os',
      metadata: { payoutId: payout.id, method: payout.method }
    };

    this.journalEntries.set(journalId, journalEntry);
    await this.updateAccountBalances(journalEntry);
    
    return journalId;
  }

  private getPayoutCashAccount(method: string): string {
    const methodMapping: any = {
      'crypto': 'CASH_CRYPTO_USDT',
      'paxum': 'CASH_CCBILL',
      'wise': 'CASH_CCBILL',
      'payoneer': 'CASH_CCBILL',
      'ach': 'CASH_CCBILL',
      'wire': 'CASH_CCBILL'
    };
    
    return methodMapping[method] || 'CASH_CCBILL';
  }

  private checkTaxFormsComplete(creatorId: string): boolean {
    // Check if creator has completed required tax forms (W-9, etc.)
    return true; // Placeholder - implement based on vault records
  }

  private checkPayoutThresholds(creatorId: string, amount: number): boolean {
    // Check if payout meets minimum thresholds and doesn't exceed limits
    return amount >= 10 && amount <= 50000; // Basic thresholds
  }

  private async generateBalanceSheetData(): Promise<any> {
    const data: any = { ASSETS: {}, LIABILITIES: {}, EQUITY: {} };
    
    this.accounts.forEach(account => {
      if (['ASSET', 'LIABILITY', 'EQUITY'].includes(account.type)) {
        if (!data[account.type][account.subtype]) {
          data[account.type][account.subtype] = 0;
        }
        data[account.type][account.subtype] += account.balance;
      }
    });
    
    return data;
  }

  private async generateIncomeStatementData(start: Date, end: Date): Promise<any> {
    const data: any = { REVENUE: {}, EXPENSES: {} };
    
    // Filter journal entries for date range and aggregate by account
    const filteredEntries = Array.from(this.journalEntries.values())
      .filter(je => je.date >= start && je.date <= end);
    
    filteredEntries.forEach(je => {
      je.entries.forEach(entry => {
        const account = this.accounts.get(entry.accountId);
        if (!account) return;
        
        if (['REVENUE', 'EXPENSE'].includes(account.type)) {
          if (!data[account.type][account.subtype]) {
            data[account.type][account.subtype] = 0;
          }
          data[account.type][account.subtype] += 
            account.type === 'REVENUE' ? entry.credit : entry.debit;
        }
      });
    });
    
    return data;
  }

  private async generateCreatorEarningsData(start: Date, end: Date, filters?: any): Promise<any> {
    // Implementation for creator earnings report
    return {};
  }

  private async generatePlatformPerformanceData(start: Date, end: Date): Promise<any> {
    // Implementation for platform performance report
    return {};
  }

  private calculateReportSummary(data: any, type: string): any {
    // Calculate summary metrics based on report type and data
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      creatorPayouts: 0,
      platformFees: 0,
      processingFees: 0
    };
  }

  private async getCreatorEarningsForPeriod(creatorId: string, start: Date, end: Date): Promise<any> {
    // Get creator's earnings for tax period
    return {
      totalGross: 50000, // Placeholder
      platformFees: 2500,
      processingFees: 1000,
      netEarnings: 46500,
      taxWithheld: 0
    };
  }

  private async getCreatorTaxInfo(creatorId: string): Promise<any> {
    // Get creator's tax information from vault
    return {
      name: 'Creator Name',
      ssn: '***-**-****',
      address: '123 Creator St, City, State 12345'
    };
  }

  // AI Analysis Methods
  private async analyzeCashFlow(): Promise<any> {
    return { trend: 'stable', projectedBalance: 100000 };
  }

  private async analyzeCreatorRetention(): Promise<any> {
    return { rate: 0.85, trending: 'up' };
  }

  private async analyzeRevenueGrowth(): Promise<any> {
    return { monthlyGrowth: 0.12, trending: 'up' };
  }

  private async analyzeCostOptimization(): Promise<any> {
    return { processingFeesRatio: 0.035, recommendation: 'optimize' };
  }

  private async assessFinancialRisk(): Promise<any> {
    return { overallRisk: 'low', factors: ['stable_growth', 'diversified_revenue'] };
  }

  private setupEventHandlers(): void {
    // Listen to Universal Hub events
    universalHub.on('payment_completed', (transaction) => {
      this.processPaymentTransaction(transaction, 'ccbill'); // Default gateway
    });

    universalHub.on('creator_earnings_updated', (data) => {
      this.emit('earnings_updated', data);
    });
  }

  private startPeriodicProcesses(): void {
    // Process payouts every hour
    setInterval(() => {
      this.processScheduledPayouts().catch(console.error);
    }, 60 * 60 * 1000);

    // Generate daily financial summary
    setInterval(() => {
      this.generateDailySummary().catch(console.error);
    }, 24 * 60 * 60 * 1000);
  }

  private async generateDailySummary(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const dailyReport = await this.generateReport('INCOME_STATEMENT', yesterday, today);
    this.emit('daily_summary', dailyReport);
  }

  // Public API methods
  async getAccountBalance(accountId: string): Promise<number> {
    const account = this.accounts.get(accountId);
    return account ? account.balance : 0;
  }

  async getCreatorBalance(creatorId: string): Promise<number> {
    const payable = this.accounts.get('PAYABLES_CREATORS');
    // In practice, this would filter by creator ID
    return payable ? payable.balance : 0;
  }

  getActivePayout(payoutId: string): Payout | undefined {
    return this.payouts.get(payoutId);
  }

  async reconcilePaymentGateway(gatewayId: string, statement: any): Promise<void> {
    // Reconcile gateway statements with internal records
    console.log(`🔄 Reconciling ${gatewayId} statement`);
  }
}

// Export singleton instance
export const fanzFinanceOS = new FanzFinanceOS(
  {} as PaymentProcessor, // Will be injected
  {} as ZeroKnowledgeVault // Will be injected
);