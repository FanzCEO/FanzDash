/**
 * FANZ Template Engine
 * Handles rendering of all templates with variable substitution
 * Supports: Email, SMS, Financial Documents, Reports, CRM, Content Inventory
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TemplateVariables {
  [key: string]: any;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  category: 'financial' | 'email' | 'sms' | 'budget' | 'inventory' | 'crm' | 'report';
  description: string;
  requiredVariables: string[];
  optionalVariables?: string[];
  version: string;
  lastUpdated: string;
  fanzBranded: boolean;
}

export class TemplateEngine {
  private templateCache: Map<string, string> = new Map();
  private metadataCache: Map<string, TemplateMetadata> = new Map();

  /**
   * Render template with variables
   */
  async render(templatePath: string, variables: TemplateVariables): Promise<string> {
    let template = await this.loadTemplate(templatePath);

    // Replace all {{variable}} patterns
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Render template with conditional blocks and loops
   */
  async renderAdvanced(templatePath: string, variables: TemplateVariables): Promise<string> {
    let template = await this.loadTemplate(templatePath);

    // Handle conditional blocks {{#if variable}}...{{/if}}
    template = template.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
      return variables[variable] ? content : '';
    });

    // Handle else blocks {{#if variable}}...{{else}}...{{/if}}
    template = template.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, variable, trueContent, falseContent) => {
        return variables[variable] ? trueContent : falseContent;
      }
    );

    // Handle loops {{#each items}}...{{/each}}
    template = template.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, variable, content) => {
      const items = variables[variable];
      if (!Array.isArray(items)) return '';

      return items.map((item, index) => {
        return content
          .replace(/\{\{this\.(\w+)\}\}/g, (m, prop) => {
            return item[prop] !== undefined ? String(item[prop]) : m;
          })
          .replace(/\{\{@index\}\}/g, String(index))
          .replace(/\{\{@first\}\}/g, String(index === 0))
          .replace(/\{\{@last\}\}/g, String(index === items.length - 1));
      }).join('');
    });

    // Replace simple variables
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Load template from file or cache
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    const fullPath = path.join(__dirname, templatePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    this.templateCache.set(templatePath, content);
    return content;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Validate required variables
   */
  async validateVariables(templatePath: string, variables: TemplateVariables): Promise<{
    valid: boolean;
    missing: string[];
  }> {
    const metadata = await this.getMetadata(templatePath);
    const missing = metadata.requiredVariables.filter(
      varName => !(varName in variables)
    );

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Get template metadata
   */
  async getMetadata(templatePath: string): Promise<TemplateMetadata> {
    if (this.metadataCache.has(templatePath)) {
      return this.metadataCache.get(templatePath)!;
    }

    const metadataPath = templatePath.replace(/\.(html|txt|md)$/, '.meta.json');
    try {
      const fullPath = path.join(__dirname, metadataPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const metadata = JSON.parse(content);
      this.metadataCache.set(templatePath, metadata);
      return metadata;
    } catch {
      // Return default metadata if file doesn't exist
      return {
        id: path.basename(templatePath),
        name: path.basename(templatePath),
        category: 'email',
        description: 'No description available',
        requiredVariables: [],
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        fanzBranded: true
      };
    }
  }

  /**
   * List all templates in a category
   */
  async listTemplates(category?: string): Promise<TemplateMetadata[]> {
    const categories = category ? [category] : ['financial', 'email', 'sms', 'budget', 'inventory', 'crm', 'report'];
    const templates: TemplateMetadata[] = [];

    for (const cat of categories) {
      try {
        const dirPath = path.join(__dirname, cat);
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          if (file.endsWith('.meta.json')) {
            const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
            templates.push(JSON.parse(content));
          }
        }
      } catch {
        // Category directory doesn't exist yet
      }
    }

    return templates;
  }

  /**
   * Format currency for FANZ
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Format date for FANZ
   */
  formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'long'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US');
      case 'long':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'iso':
        return d.toISOString();
      default:
        return d.toLocaleDateString('en-US');
    }
  }
}

// Export singleton instance
export const templateEngine = new TemplateEngine();
