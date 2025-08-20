type SectionType = 'discussion' | 'presentation' | 'brainstorm' | 'review' | 'decision' | 'action_planning';

interface AgendaSection {
  id?: string;
  section: string;
  purpose: string;
  time_minutes: number;
  section_type?: SectionType;
  questions?: string[];
  talking_points?: string[];
  checklist?: string[];
  notes?: string;
  components?: any;
}

interface TemplateData {
  key_messages?: string[];
  agenda_sections?: AgendaSection[];
  setup?: any;
  expected_outputs?: string[];
  learning_objectives?: string[];
}

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  sectionIndex?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  lastValidated: number;
  validationTime: number;
}

// Cache for validation results to avoid re-computation
const validationCache = new Map<string, ValidationResult>();

// Generate cache key for template data
const generateCacheKey = (templateData: TemplateData): string => {
  return JSON.stringify({
    key_messages: templateData.key_messages,
    agenda_sections: templateData.agenda_sections?.map(s => ({
      section: s.section,
      purpose: s.purpose,
      time_minutes: s.time_minutes,
      section_type: s.section_type,
      questions: s.questions,
      talking_points: s.talking_points,
      checklist: s.checklist,
      notes: s.notes
    })),
    setup: templateData.setup,
    expected_outputs: templateData.expected_outputs,
    learning_objectives: templateData.learning_objectives
  });
};

// Smart validation that only validates changed sections
export const validateTemplate = (templateData: TemplateData, changedSections?: number[]): ValidationResult => {
  const startTime = performance.now();
  const cacheKey = generateCacheKey(templateData);
  
  // Check cache first
  if (validationCache.has(cacheKey)) {
    const cached = validationCache.get(cacheKey)!;
    // Return cached result if it's recent (less than 5 seconds old)
    if (Date.now() - cached.lastValidated < 5000) {
      return cached;
    }
  }
  
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate key messages (low priority)
  if (templateData.key_messages) {
    if (templateData.key_messages.length === 0) {
      warnings.push({
        type: 'warning',
        field: 'key_messages',
        message: 'Consider adding key messages to guide the meeting',
        priority: 'low'
      });
    }

    templateData.key_messages.forEach((message, index) => {
      if (!message || message.trim() === '') {
        warnings.push({
          type: 'warning',
          field: 'key_messages',
          message: `Key message ${index + 1} is empty`,
          priority: 'low'
        });
      }
    });
  }

  // Smart agenda section validation
  if (!templateData.agenda_sections || templateData.agenda_sections.length === 0) {
    errors.push({
      type: 'error',
      field: 'agenda_sections',
      message: 'At least one agenda section is required',
      priority: 'critical'
    });
  } else {
    let totalTime = 0;
    const sectionNames = new Set<string>();

    // If specific sections changed, only validate those + critical checks
    const sectionsToValidate = changedSections 
      ? changedSections.map(i => templateData.agenda_sections![i])
      : templateData.agenda_sections;

    sectionsToValidate.forEach((section, index) => {
      const actualIndex = changedSections ? changedSections[index] : index;
      
      // Critical validation (always run)
      if (!section.section || section.section.trim() === '') {
        errors.push({
          type: 'error',
          field: 'section',
          message: 'Section name is required',
          sectionIndex: actualIndex,
          priority: 'critical'
        });
      } else {
        // Check for duplicate section names
        const normalizedName = section.section.trim().toLowerCase();
        if (sectionNames.has(normalizedName)) {
          warnings.push({
            type: 'warning',
            field: 'section',
            message: `Section name "${section.section}" appears to be duplicated`,
            sectionIndex: actualIndex,
            priority: 'medium'
          });
        }
        sectionNames.add(normalizedName);
      }

      // High priority validation
      if (!section.purpose || section.purpose.trim() === '') {
        warnings.push({
          type: 'warning',
          field: 'purpose',
          message: 'Section purpose is recommended',
          sectionIndex: actualIndex,
          priority: 'high'
        });
      }

      // Medium priority validation
      if (section.time_minutes < 1) {
        errors.push({
          type: 'error',
          field: 'time_minutes',
          message: 'Section time must be at least 1 minute',
          sectionIndex: actualIndex,
          priority: 'medium'
        });
      } else if (section.time_minutes > 180) {
        warnings.push({
          type: 'warning',
          field: 'time_minutes',
          message: 'Section time is quite long - consider breaking it down',
          sectionIndex: actualIndex,
          priority: 'medium'
        });
      }

      // Low priority validation (only for completed sections)
      if (section.section && section.section.trim() && section.purpose && section.purpose.trim()) {
        if (!section.questions?.length && !section.talking_points?.length && !section.checklist?.length) {
          warnings.push({
            type: 'warning',
            field: 'content',
            message: 'Consider adding questions, talking points, or checklist items',
            sectionIndex: actualIndex,
            priority: 'low'
          });
        }
      }

      totalTime += section.time_minutes;
    });

    // Total time validation (only if all sections were validated)
    if (!changedSections && totalTime > 240) {
      warnings.push({
        type: 'warning',
        field: 'total_time',
        message: `Total meeting time is ${totalTime} minutes - consider if this is realistic`,
        priority: 'medium'
      });
    }
  }

  // Validate other fields (low priority)
  if (templateData.setup && typeof templateData.setup === 'object') {
    if (Object.keys(templateData.setup).length === 0) {
      warnings.push({
        type: 'warning',
        field: 'setup',
        message: 'Meeting setup is empty',
        priority: 'low'
      });
    }
  }

  if (templateData.expected_outputs && templateData.expected_outputs.length === 0) {
    warnings.push({
      type: 'warning',
      field: 'expected_outputs',
      message: 'Consider defining expected meeting outputs',
      priority: 'low'
    });
  }

  const validationTime = performance.now() - startTime;
  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors: errors.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority)),
    warnings: warnings.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority)),
    lastValidated: Date.now(),
    validationTime
  };

  // Cache the result
  validationCache.set(cacheKey, result);
  
  // Clean up old cache entries (keep only last 10)
  if (validationCache.size > 10) {
    const keys = Array.from(validationCache.keys());
    keys.slice(0, keys.length - 10).forEach(key => validationCache.delete(key));
  }

  return result;
};

// Priority scoring for sorting validation results
const getPriorityScore = (priority: string): number => {
  switch (priority) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

// Validate specific sections only (for performance)
export const validateSections = (sections: AgendaSection[], sectionIndices: number[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  sectionIndices.forEach(index => {
    const section = sections[index];
    if (!section) return;

    // Critical validation only for changed sections
    if (!section.section || section.section.trim() === '') {
      errors.push({
        type: 'error',
        field: 'section',
        message: 'Section name is required',
        sectionIndex: index,
        priority: 'critical'
      });
    }

    if (section.time_minutes < 1) {
      errors.push({
        type: 'error',
        field: 'time_minutes',
        message: 'Section time must be at least 1 minute',
        sectionIndex: index,
        priority: 'medium'
      });
    }
  });

  return errors;
};

// Get validation summary with performance metrics
export const getValidationSummary = (validation: ValidationResult): string => {
  const totalIssues = validation.errors.length + validation.warnings.length;
  const criticalIssues = validation.errors.filter(e => e.priority === 'critical').length;
  
  if (totalIssues === 0) {
    return `✅ Valid (${validation.validationTime.toFixed(1)}ms)`;
  }
  
  if (criticalIssues > 0) {
    return `❌ ${criticalIssues} critical issues, ${totalIssues} total (${validation.validationTime.toFixed(1)}ms)`;
  }
  
  return `⚠️ ${validation.warnings.length} warnings (${validation.validationTime.toFixed(1)}ms)`;
};