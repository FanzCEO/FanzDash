import { EventEmitter } from 'events';

/**
 * Advanced Policy Search and Navigation System
 *
 * Features:
 * - Full-text search across all policies
 * - Category/tag filtering
 * - Legal reference lookup
 * - Related policy recommendations
 * - Drill-down navigation
 * - Quick answers to common questions
 * - Multi-language support
 * - Accessibility features
 */

export interface PolicySection {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  legalReferences?: string[];
  relatedSections?: string[];
  keywords?: string[];
  faqs?: FAQ[];
  lastUpdated: Date;
  version: string;
  requiresAcknowledgment: boolean;
  applicableTo?: string[]; // Employee types, departments, locations
}

export interface FAQ {
  question: string;
  answer: string;
  relatedPolicies?: string[];
}

export interface SearchResult {
  section: PolicySection;
  relevance: number;
  matchedTerms: string[];
  snippet: string;
  highlights: string[];
}

export interface SearchFilter {
  categories?: string[];
  subcategories?: string[];
  legalReferences?: string[];
  keywords?: string[];
  dateRange?: { from: Date; to: Date };
  requiresAcknowledgment?: boolean;
}

export class PolicySearchSystem extends EventEmitter {
  private policySections: Map<string, PolicySection> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // word -> section IDs
  private categoryIndex: Map<string, Set<string>> = new Map();
  private legalRefIndex: Map<string, Set<string>> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.initializePolicySections();
    this.buildSearchIndexes();
    console.log('🔍 Policy Search System initialized');
  }

  // Initialize all policy sections
  private initializePolicySections(): void {
    const sections: PolicySection[] = [
      // Add all policy sections here
      {
        id: 'eeo_001',
        title: 'Equal Employment Opportunity',
        category: 'Anti-Discrimination',
        subcategory: 'Employment Practices',
        content: 'Equal Employment Opportunity Policy content...',
        legalReferences: ['Title VII', '42 USC 2000e', 'ADA', 'ADEA'],
        keywords: ['discrimination', 'equal opportunity', 'protected class', 'hiring', 'promotion'],
        faqs: [
          {
            question: 'What characteristics are protected under our EEO policy?',
            answer: 'Protected characteristics include race, color, religion, sex, national origin, age (40+), disability, genetic information, sexual orientation, gender identity, veteran status, and military service.',
            relatedPolicies: ['anti_harassment_001', 'ada_001']
          },
          {
            question: 'How do I report discrimination?',
            answer: 'Report discrimination to your supervisor, HR, or any member of management. You can also use the anonymous hotline or online reporting system.',
            relatedPolicies: ['reporting_001', 'anti_harassment_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '3.0',
        requiresAcknowledgment: true,
        applicableTo: ['all_employees']
      },
      {
        id: 'harassment_001',
        title: 'Anti-Harassment Policy',
        category: 'Workplace Conduct',
        subcategory: 'Prohibited Behavior',
        content: 'Anti-Harassment Policy content...',
        legalReferences: ['Title VII', 'EEOC Guidelines', 'State harassment laws'],
        relatedSections: ['eeo_001', 'reporting_001', 'retaliation_001'],
        keywords: ['sexual harassment', 'hostile work environment', 'quid pro quo', 'bullying', 'intimidation'],
        faqs: [
          {
            question: 'What constitutes sexual harassment?',
            answer: 'Sexual harassment includes unwelcome sexual advances, requests for sexual favors, and other verbal or physical conduct of a sexual nature that affects employment or creates a hostile work environment.',
            relatedPolicies: ['eeo_001', 'reporting_001']
          },
          {
            question: 'Can I be fired for reporting harassment?',
            answer: 'No. The company strictly prohibits retaliation against anyone who reports harassment in good faith. Retaliation is a violation of company policy and may result in termination.',
            relatedPolicies: ['retaliation_001', 'whistleblower_001']
          },
          {
            question: 'How long does a harassment investigation take?',
            answer: 'Investigations are typically completed within 30 days. The company commits to prompt and thorough investigation of all complaints.',
            relatedPolicies: ['investigation_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '2.0',
        requiresAcknowledgment: true,
        applicableTo: ['all_employees']
      },
      {
        id: 'ada_001',
        title: 'ADA Reasonable Accommodations',
        category: 'Disability Rights',
        subcategory: 'Accommodations',
        content: 'ADA Reasonable Accommodations policy...',
        legalReferences: ['ADA', '42 USC 12111-12117', '29 CFR 1630'],
        relatedSections: ['eeo_001', 'leave_medical_001'],
        keywords: ['disability', 'accommodation', 'reasonable', 'interactive process', 'undue hardship'],
        faqs: [
          {
            question: 'How do I request a reasonable accommodation?',
            answer: 'Contact HR to begin the interactive process. You may need to provide medical documentation supporting your request.',
            relatedPolicies: ['medical_privacy_001']
          },
          {
            question: 'What are examples of reasonable accommodations?',
            answer: 'Examples include modified work schedules, assistive technology, ergonomic equipment, modified duties, or changes to the work environment. Accommodations are individualized based on specific needs.',
            relatedPolicies: ['ergonomics_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '1.0',
        requiresAcknowledgment: false,
        applicableTo: ['all_employees', 'managers']
      },
      {
        id: 'safety_001',
        title: 'Workplace Safety Policy',
        category: 'Safety and Health',
        subcategory: 'General Safety',
        content: 'Workplace Safety Policy content...',
        legalReferences: ['OSHA', '29 USC 654', '29 CFR 1910'],
        relatedSections: ['emergency_001', 'ppe_001', 'incident_reporting_001'],
        keywords: ['safety', 'OSHA', 'hazard', 'injury', 'PPE', 'emergency'],
        faqs: [
          {
            question: 'Who is responsible for workplace safety?',
            answer: 'Safety is everyone\'s responsibility. The employer provides a safe workplace and training, while employees must follow safety rules and report hazards.',
            relatedPolicies: ['employee_responsibilities_001']
          },
          {
            question: 'What should I do if I see an unsafe condition?',
            answer: 'Report it immediately to your supervisor or the Safety Officer. You can also use the anonymous safety hotline.',
            relatedPolicies: ['incident_reporting_001', 'whistleblower_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '1.0',
        requiresAcknowledgment: true,
        applicableTo: ['all_employees']
      },
      {
        id: 'overtime_001',
        title: 'Overtime Pay Policy',
        category: 'Compensation',
        subcategory: 'Overtime',
        content: 'Overtime Pay Policy content...',
        legalReferences: ['FLSA', '29 USC 207', 'State overtime laws'],
        relatedSections: ['classification_001', 'timekeeping_001'],
        keywords: ['overtime', 'time and a half', 'hours worked', 'workweek', 'FLSA'],
        faqs: [
          {
            question: 'Who is eligible for overtime pay?',
            answer: 'Non-exempt employees are eligible for overtime pay at 1.5 times their regular rate for hours over 40 in a workweek.',
            relatedPolicies: ['classification_001', 'exempt_duties_001']
          },
          {
            question: 'Do I need approval to work overtime?',
            answer: 'Yes, all overtime must be approved in advance by your supervisor. Unauthorized overtime will still be paid but may result in disciplinary action.',
            relatedPolicies: ['timekeeping_001', 'discipline_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '1.0',
        requiresAcknowledgment: false,
        applicableTo: ['non_exempt_employees']
      },
      {
        id: 'fmla_001',
        title: 'Family and Medical Leave (FMLA)',
        category: 'Leave Benefits',
        subcategory: 'Protected Leave',
        content: 'FMLA Policy content...',
        legalReferences: ['FMLA', '29 USC 2601-2654', '29 CFR 825'],
        relatedSections: ['benefits_health_001', 'job_protection_001'],
        keywords: ['FMLA', 'medical leave', 'family leave', 'serious health condition', 'job protection'],
        faqs: [
          {
            question: 'Am I eligible for FMLA leave?',
            answer: 'You\'re eligible if you\'ve worked for the company for 12 months, have 1,250 hours in the past 12 months, and work at a location with 50+ employees within 75 miles.',
            relatedPolicies: ['eligibility_001']
          },
          {
            question: 'What reasons qualify for FMLA leave?',
            answer: 'Qualifying reasons include: birth/adoption of a child, care for family member with serious health condition, your own serious health condition, or military family leave.',
            relatedPolicies: ['medical_certification_001']
          }
        ],
        lastUpdated: new Date('2024-01-01'),
        version: '1.0',
        requiresAcknowledgment: false,
        applicableTo: ['all_employees']
      }
    ];

    sections.forEach(section => {
      this.policySections.set(section.id, section);
    });
  }

  // Build search indexes for fast lookup
  private buildSearchIndexes(): void {
    this.policySections.forEach((section, id) => {
      // Index full text content
      const words = this.tokenize(section.content + ' ' + section.title);
      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)!.add(id);
      });

      // Index categories
      if (!this.categoryIndex.has(section.category)) {
        this.categoryIndex.set(section.category, new Set());
      }
      this.categoryIndex.get(section.category)!.add(id);

      if (section.subcategory) {
        if (!this.categoryIndex.has(section.subcategory)) {
          this.categoryIndex.set(section.subcategory, new Set());
        }
        this.categoryIndex.get(section.subcategory)!.add(id);
      }

      // Index legal references
      section.legalReferences?.forEach(ref => {
        if (!this.legalRefIndex.has(ref)) {
          this.legalRefIndex.set(ref, new Set());
        }
        this.legalRefIndex.get(ref)!.add(id);
      });

      // Index keywords
      section.keywords?.forEach(keyword => {
        const normalized = keyword.toLowerCase().trim();
        if (!this.keywordIndex.has(normalized)) {
          this.keywordIndex.set(normalized, new Set());
        }
        this.keywordIndex.get(normalized)!.add(id);
      });
    });

    console.log(`📚 Indexed ${this.policySections.size} policy sections`);
  }

  // Tokenize text for search
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out very short words
  }

  // Full-text search with ranking
  search(query: string, filters?: SearchFilter): SearchResult[] {
    const queryWords = this.tokenize(query);
    const results = new Map<string, { score: number; matchedTerms: Set<string> }>();

    // Search by query words
    queryWords.forEach(word => {
      const sectionIds = this.searchIndex.get(word) || new Set();
      sectionIds.forEach(id => {
        if (!results.has(id)) {
          results.set(id, { score: 0, matchedTerms: new Set() });
        }
        const result = results.get(id)!;
        result.score += 1;
        result.matchedTerms.add(word);
      });
    });

    // Apply filters
    let filteredResults = Array.from(results.entries());

    if (filters) {
      filteredResults = filteredResults.filter(([id]) => {
        const section = this.policySections.get(id)!;

        if (filters.categories && !filters.categories.includes(section.category)) {
          return false;
        }

        if (filters.subcategories && section.subcategory &&
            !filters.subcategories.includes(section.subcategory)) {
          return false;
        }

        if (filters.legalReferences && section.legalReferences) {
          const hasMatch = filters.legalReferences.some(ref =>
            section.legalReferences!.includes(ref)
          );
          if (!hasMatch) return false;
        }

        if (filters.requiresAcknowledgment !== undefined &&
            section.requiresAcknowledgment !== filters.requiresAcknowledgment) {
          return false;
        }

        if (filters.dateRange) {
          if (section.lastUpdated < filters.dateRange.from ||
              section.lastUpdated > filters.dateRange.to) {
            return false;
          }
        }

        return true;
      });
    }

    // Sort by relevance score
    filteredResults.sort((a, b) => b[1].score - a[1].score);

    // Convert to SearchResult objects
    return filteredResults.map(([id, { score, matchedTerms }]) => {
      const section = this.policySections.get(id)!;
      const snippet = this.generateSnippet(section.content, Array.from(matchedTerms));
      const highlights = this.generateHighlights(section.content, Array.from(matchedTerms));

      return {
        section,
        relevance: score / queryWords.length, // Normalize by query length
        matchedTerms: Array.from(matchedTerms),
        snippet,
        highlights
      };
    });
  }

  // Search by category
  searchByCategory(category: string): PolicySection[] {
    const sectionIds = this.categoryIndex.get(category) || new Set();
    return Array.from(sectionIds).map(id => this.policySections.get(id)!);
  }

  // Search by legal reference
  searchByLegalReference(reference: string): PolicySection[] {
    const sectionIds = this.legalRefIndex.get(reference) || new Set();
    return Array.from(sectionIds).map(id => this.policySections.get(id)!);
  }

  // Search by keyword
  searchByKeyword(keyword: string): PolicySection[] {
    const normalized = keyword.toLowerCase().trim();
    const sectionIds = this.keywordIndex.get(normalized) || new Set();
    return Array.from(sectionIds).map(id => this.policySections.get(id)!);
  }

  // Get related policies
  getRelatedPolicies(sectionId: string): PolicySection[] {
    const section = this.policySections.get(sectionId);
    if (!section || !section.relatedSections) {
      return [];
    }

    return section.relatedSections
      .map(id => this.policySections.get(id))
      .filter(s => s !== undefined) as PolicySection[];
  }

  // Search FAQs
  searchFAQs(query: string): Array<{ section: PolicySection; faq: FAQ }> {
    const queryLower = query.toLowerCase();
    const results: Array<{ section: PolicySection; faq: FAQ }> = [];

    this.policySections.forEach(section => {
      section.faqs?.forEach(faq => {
        if (faq.question.toLowerCase().includes(queryLower) ||
            faq.answer.toLowerCase().includes(queryLower)) {
          results.push({ section, faq });
        }
      });
    });

    return results;
  }

  // Get all categories
  getAllCategories(): string[] {
    return Array.from(this.categoryIndex.keys());
  }

  // Get all legal references
  getAllLegalReferences(): string[] {
    return Array.from(this.legalRefIndex.keys());
  }

  // Generate snippet from content
  private generateSnippet(content: string, matchedTerms: string[], length: number = 200): string {
    // Find first occurrence of any matched term
    const lowerContent = content.toLowerCase();
    let startPos = -1;

    for (const term of matchedTerms) {
      const pos = lowerContent.indexOf(term);
      if (pos !== -1 && (startPos === -1 || pos < startPos)) {
        startPos = pos;
      }
    }

    if (startPos === -1) {
      return content.substring(0, length) + '...';
    }

    // Get context around the match
    const start = Math.max(0, startPos - 50);
    const end = Math.min(content.length, startPos + length);

    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  // Generate highlights from content
  private generateHighlights(content: string, matchedTerms: string[], maxHighlights: number = 3): string[] {
    const highlights: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const term of matchedTerms) {
      let pos = 0;
      while ((pos = lowerContent.indexOf(term, pos)) !== -1 && highlights.length < maxHighlights) {
        const start = Math.max(0, pos - 30);
        const end = Math.min(content.length, pos + term.length + 30);
        let highlight = content.substring(start, end);

        if (start > 0) highlight = '...' + highlight;
        if (end < content.length) highlight = highlight + '...';

        highlights.push(highlight);
        pos += term.length;
      }

      if (highlights.length >= maxHighlights) break;
    }

    return highlights;
  }

  // Get policy section by ID
  getSection(id: string): PolicySection | undefined {
    return this.policySections.get(id);
  }

  // Get all sections
  getAllSections(): PolicySection[] {
    return Array.from(this.policySections.values());
  }

  // Get table of contents
  getTableOfContents(): any {
    const toc: any = {};

    this.policySections.forEach(section => {
      if (!toc[section.category]) {
        toc[section.category] = {
          sections: [],
          subcategories: {}
        };
      }

      if (section.subcategory) {
        if (!toc[section.category].subcategories[section.subcategory]) {
          toc[section.category].subcategories[section.subcategory] = [];
        }
        toc[section.category].subcategories[section.subcategory].push({
          id: section.id,
          title: section.title
        });
      } else {
        toc[section.category].sections.push({
          id: section.id,
          title: section.title
        });
      }
    });

    return toc;
  }

  // Auto-suggest based on partial query
  autoSuggest(partial: string, limit: number = 10): string[] {
    const partialLower = partial.toLowerCase();
    const suggestions = new Set<string>();

    // Suggest from titles
    this.policySections.forEach(section => {
      if (section.title.toLowerCase().includes(partialLower)) {
        suggestions.add(section.title);
      }
    });

    // Suggest from keywords
    this.keywordIndex.forEach((_, keyword) => {
      if (keyword.includes(partialLower)) {
        suggestions.add(keyword);
      }
    });

    // Suggest from FAQs
    this.policySections.forEach(section => {
      section.faqs?.forEach(faq => {
        if (faq.question.toLowerCase().includes(partialLower)) {
          suggestions.add(faq.question);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

export const policySearchSystem = new PolicySearchSystem();
