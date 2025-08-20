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
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const validateTemplate = (templateData: TemplateData): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate key messages
  if (templateData.key_messages) {
    if (templateData.key_messages.length === 0) {
      warnings.push({
        type: 'warning',
        field: 'key_messages',
        message: 'Consider adding key messages to guide the meeting'
      });
    }

    templateData.key_messages.forEach((message, index) => {
      if (!message || message.trim() === '') {
        warnings.push({
          type: 'warning',
          field: 'key_messages',
          message: `Key message ${index + 1} is empty`
        });
      }
    });
  }

  // Validate agenda sections
  if (!templateData.agenda_sections || templateData.agenda_sections.length === 0) {
    errors.push({
      type: 'error',
      field: 'agenda_sections',
      message: 'At least one agenda section is required'
    });
  } else {
    let totalTime = 0;
    const sectionNames = new Set<string>();

    templateData.agenda_sections.forEach((section, index) => {
      // Validate section name
      if (!section.section || section.section.trim() === '') {
        errors.push({
          type: 'error',
          field: 'section',
          message: 'Section name is required',
          sectionIndex: index
        });
      } else {
        // Check for duplicate section names
        const normalizedName = section.section.trim().toLowerCase();
        if (sectionNames.has(normalizedName)) {
          warnings.push({
            type: 'warning',
            field: 'section',
            message: `Section name "${section.section}" appears to be duplicated`,
            sectionIndex: index
          });
        }
        sectionNames.add(normalizedName);
      }

      // Validate purpose
      if (!section.purpose || section.purpose.trim() === '') {
        warnings.push({
          type: 'warning',
          field: 'purpose',
          message: 'Section purpose helps participants understand the goal',
          sectionIndex: index
        });
      }

      // Validate time allocation
      if (!section.time_minutes || section.time_minutes <= 0) {
        errors.push({
          type: 'error',
          field: 'time_minutes',
          message: 'Section must have a valid time allocation',
          sectionIndex: index
        });
      } else {
        totalTime += section.time_minutes;
        
        if (section.time_minutes > 120) {
          warnings.push({
            type: 'warning',
            field: 'time_minutes',
            message: 'Section longer than 2 hours may be difficult to manage',
            sectionIndex: index
          });
        }
      }

      // Validate section content
      const hasQuestions = section.questions && section.questions.some(q => q.trim() !== '');
      const hasTalkingPoints = section.talking_points && section.talking_points.some(tp => tp.trim() !== '');
      const hasChecklist = section.checklist && section.checklist.some(c => c.trim() !== '');
      const hasNotes = section.notes && section.notes.trim() !== '';

      if (!hasQuestions && !hasTalkingPoints && !hasChecklist && !hasNotes) {
        warnings.push({
          type: 'warning',
          field: 'content',
          message: 'Section has no content (questions, talking points, checklist, or notes)',
          sectionIndex: index
        });
      }

      // Validate empty arrays
      if (section.questions?.some(q => q.trim() === '')) {
        warnings.push({
          type: 'warning',
          field: 'questions',
          message: 'Remove empty questions or add content',
          sectionIndex: index
        });
      }

      if (section.talking_points?.some(tp => tp.trim() === '')) {
        warnings.push({
          type: 'warning',
          field: 'talking_points',
          message: 'Remove empty talking points or add content',
          sectionIndex: index
        });
      }

      if (section.checklist?.some(c => c.trim() === '')) {
        warnings.push({
          type: 'warning',
          field: 'checklist',
          message: 'Remove empty checklist items or add content',
          sectionIndex: index
        });
      }
    });

    // Validate total meeting time
    if (totalTime > 480) {
      warnings.push({
        type: 'warning',
        field: 'total_time',
        message: `Meeting duration (${Math.floor(totalTime / 60)}h ${totalTime % 60}m) is very long - consider breaking into multiple sessions`
      });
    } else if (totalTime < 15) {
      warnings.push({
        type: 'warning',
        field: 'total_time',
        message: `Meeting duration (${totalTime}m) is very short - consider if all sections are necessary`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getValidationSummary = (validation: ValidationResult): string => {
  if (validation.isValid && validation.warnings.length === 0) {
    return 'Template is valid with no issues';
  }
  
  const parts: string[] = [];
  
  if (validation.errors.length > 0) {
    parts.push(`${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`);
  }
  
  if (validation.warnings.length > 0) {
    parts.push(`${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''}`);
  }
  
  return `Template has ${parts.join(' and ')}`;
};