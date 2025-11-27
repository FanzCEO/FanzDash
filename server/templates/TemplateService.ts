/**
 * FANZ Template Management Service
 * Provides API for managing and rendering all templates
 */

import { templateEngine, TemplateVariables, TemplateMetadata } from './TemplateEngine';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateService {
  /**
   * Render financial invoice
   */
  async renderInvoice(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('financial/creator-invoice.html', variables);
  }

  /**
   * Render payout statement
   */
  async renderPayoutStatement(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('financial/payout-statement.html', variables);
  }

  /**
   * Render welcome email
   */
  async renderWelcomeEmail(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('email/creator-welcome.html', variables);
  }

  /**
   * Render payout notification email
   */
  async renderPayoutEmail(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('email/payout-notification.html', variables);
  }

  /**
   * Render SMS template
   */
  async renderSMS(templateName: string, variables: TemplateVariables): Promise<string> {
    return templateEngine.render(`sms/${templateName}.txt`, variables);
  }

  /**
   * Render budget report
   */
  async renderBudget(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('budget/creator-monthly-budget.html', variables);
  }

  /**
   * Render content inventory
   */
  async renderInventory(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('inventory/content-library.html', variables);
  }

  /**
   * Get all available templates
   */
  async getTemplatesList(category?: string): Promise<TemplateMetadata[]> {
    return templateEngine.listTemplates(category);
  }

  /**
   * Get template metadata
   */
  async getTemplateMetadata(templatePath: string): Promise<TemplateMetadata> {
    return templateEngine.getMetadata(templatePath);
  }

  /**
   * Validate template variables
   */
  async validateTemplate(templatePath: string, variables: TemplateVariables): Promise<{
    valid: boolean;
    missing: string[];
  }> {
    return templateEngine.validateVariables(templatePath, variables);
  }

  /**
   * Render any template by path
   */
  async renderTemplate(templatePath: string, variables: TemplateVariables, useAdvanced: boolean = true): Promise<string> {
    if (useAdvanced) {
      return templateEngine.renderAdvanced(templatePath, variables);
    }
    return templateEngine.render(templatePath, variables);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    templateEngine.clearCache();
  }

  /**
   * Format currency helper
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return templateEngine.formatCurrency(amount, currency);
  }

  /**
   * Format date helper
   */
  formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'long'): string {
    return templateEngine.formatDate(date, format);
  }

  /**
   * Generate sample invoice data (for testing)
   */
  getSampleInvoiceData(): TemplateVariables {
    return {
      invoice: {
        number: 'INV-2025-001',
        date: this.formatDate(new Date()),
        dueDate: this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      },
      platform: {
        name: 'BoyFanz'
      },
      creator: {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        username: 'alexmorgan',
        address: '123 Creator St, Los Angeles, CA 90001'
      },
      client: {
        name: 'John Smith',
        email: 'john@example.com',
        company: 'Smith Media LLC',
        address: '456 Client Ave, New York, NY 10001'
      },
      items: [
        {
          description: 'Custom Video Content',
          details: '10 minute exclusive video',
          quantity: 1,
          rate: this.formatCurrency(500),
          amount: this.formatCurrency(500)
        },
        {
          description: 'Photo Set',
          details: '50 high-resolution images',
          quantity: 1,
          rate: this.formatCurrency(200),
          amount: this.formatCurrency(200)
        }
      ],
      totals: {
        subtotal: this.formatCurrency(700),
        platformFee: this.formatCurrency(140),
        platformFeePercent: '20',
        tax: this.formatCurrency(0),
        discount: this.formatCurrency(0),
        total: this.formatCurrency(700),
        creatorEarnings: this.formatCurrency(560)
      },
      payment: {
        method: 'Credit Card',
        details: 'Visa ending in 4242',
        status: 'Paid',
        statusColor: '#4caf50'
      },
      notes: 'Thank you for your business! Payment is due within 30 days of invoice date.'
    };
  }

  /**
   * Generate sample payout statement data
   */
  getSamplePayoutData(): TemplateVariables {
    return {
      statementId: 'PAYOUT-2025-11-001',
      period: 'November 2025',
      creator: {
        name: 'Alex Morgan',
        username: 'alexmorgan',
        id: 'CRE-12345'
      },
      totalEarnings: this.formatCurrency(5280),
      platformFees: this.formatCurrency(1056),
      platformFeePercent: '20',
      netPayout: this.formatCurrency(4224),
      stats: {
        totalSubscribers: 342,
        newSubscribers: 28
      },
      platformEarnings: [
        {
          name: 'BoyFanz',
          initial: 'BF',
          subscribers: 158,
          subscriptionRevenue: this.formatCurrency(1580),
          tipsRevenue: this.formatCurrency(340),
          contentSales: this.formatCurrency(120),
          total: this.formatCurrency(2040)
        },
        {
          name: 'GayFanz',
          initial: 'GF',
          subscribers: 124,
          subscriptionRevenue: this.formatCurrency(1240),
          tipsRevenue: this.formatCurrency(280),
          contentSales: this.formatCurrency(90),
          total: this.formatCurrency(1610)
        },
        {
          name: 'FanzClips',
          initial: 'FC',
          subscribers: 60,
          subscriptionRevenue: this.formatCurrency(600),
          tipsRevenue: this.formatCurrency(150),
          contentSales: this.formatCurrency(880),
          total: this.formatCurrency(1630)
        }
      ],
      deductions: [
        {
          description: 'Platform Fee (20%)',
          details: 'Standard creator commission',
          amount: this.formatCurrency(1056)
        }
      ],
      payoutMethod: {
        type: 'Paxum',
        details: 'Account ending in 7890'
      },
      payoutStatus: 'completed',
      payoutStatusText: 'Completed',
      payoutDate: this.formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
      transactionId: 'TXN-98765432',
      generatedDate: this.formatDate(new Date())
    };
  }

  // ============================================
  // WORKFLOW TEMPLATES
  // ============================================

  /**
   * Render content creation workflow
   */
  async renderContentCreationWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/content-creation-workflow.html', variables);
  }

  /**
   * Render creator onboarding workflow
   */
  async renderCreatorOnboardingWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/creator-onboarding-workflow.html', variables);
  }

  /**
   * Render content approval workflow
   */
  async renderContentApprovalWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/content-approval-workflow.html', variables);
  }

  /**
   * Render payout request workflow
   */
  async renderPayoutRequestWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/payout-request-workflow.html', variables);
  }

  /**
   * Render marketing campaign workflow
   */
  async renderMarketingCampaignWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/marketing-campaign-workflow.html', variables);
  }

  /**
   * Render collaboration agreement workflow
   */
  async renderCollaborationAgreementWorkflow(variables: TemplateVariables): Promise<string> {
    return templateEngine.renderAdvanced('workflows/collaboration-agreement-workflow.html', variables);
  }
}

// Export singleton instance
export const templateService = new TemplateService();
