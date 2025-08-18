# Phase Editing Implementation Guide

This document outlines the implementation strategy for adding editing functionality to the single phase view, following the hybrid inline + modal editing approach.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decision](#architecture-decision)
3. [Technology Stack](#technology-stack)
4. [Implementation Strategy](#implementation-strategy)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [User Experience Patterns](#user-experience-patterns)
8. [Implementation Phases](#implementation-phases)
9. [Technical Considerations](#technical-considerations)
10. [Testing Strategy](#testing-strategy)

## Overview

The single phase view requires comprehensive editing capabilities that balance user experience with technical complexity. We've chosen a hybrid approach that combines inline editing for simple fields with modal-based editing for rich content.

## Architecture Decision

### Why Hybrid Approach?

**Inline Editing Benefits:**
- Faster editing for simple fields
- Better context preservation
- Reduced modal fatigue
- Immediate visual feedback

**Modal Editing Benefits:**
- Better UX for complex content
- Full-screen editing experience
- Rich text editor integration
- Consistent editing interface

**Hybrid Approach Benefits:**
- Best of both worlds
- Appropriate tool for each content type
- Scalable architecture
- Maintainable codebase

## Technology Stack

### Rich Text Editor
**Primary Choice: TipTap**
- Modern, extensible editor
- Excellent React integration
- Active development community
- Rich plugin ecosystem
- TypeScript support

**Alternatives Considered:**
- React Quill: Simpler but less extensible
- Draft.js: Powerful but complex
- Slate.js: Very flexible but steep learning curve

### Form Management
**Primary Choice: React Hook Form**
- Lightweight and performant
- Excellent for inline editing
- Built-in validation support
- Minimal re-renders

**Validation: Zod**
- Type-safe validation schemas
- Excellent TypeScript integration
- Runtime validation
- Schema composition

### State Management
**Local State: React useState/useReducer**
- Component-level editing state
- Optimistic updates
- Form validation state

**Server State: TanStack Query**
- Data synchronization
- Optimistic updates
- Error handling
- Cache invalidation

## Implementation Strategy

### 1. Field Classification

**Inline Editable Fields:**
- Phase Name (text input)
- Start Week (number input)
- End Week (number input)
- Start Date (date picker)
- End Date (date picker)

**Modal Editable Fields:**
- Description (rich text)
- Success Criteria (rich text)
- Constraints & Notes (rich text)

**Read-Only Fields:**
- Phase ID (auto-generated)
- Created Date (auto-generated)
- Last Updated (auto-generated)
- Working Days (calculated)

### 2. Editing Patterns

**Inline Editing Pattern:**
```typescript
const EditableField = ({ value, onSave, children }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  
  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }
  
  if (isEditing) {
    return <EditMode onSave={handleSave} onCancel={handleCancel} />
  }
  
  return (
    <div onClick={() => setIsEditing(true)}>
      {children}
    </div>
  )
}
```

**Modal Editing Pattern:**
```typescript
const RichTextModal = ({ isOpen, onClose, onSave, initialValue, title }) => {
  const [content, setContent] = useState(initialValue)
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <TipTapEditor value={content} onChange={setContent} />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </ModalFooter>
    </Modal>
  )
}
```

## Component Structure

### New Components to Create

```
src/components/features/phases/SinglePhase/components/editing/
├── EditableText.tsx           # Inline text editing
├── EditableNumber.tsx         # Inline number editing
├── EditableDate.tsx           # Inline date editing
├── RichTextModal.tsx          # Rich text editing modal
├── TipTapEditor.tsx           # TipTap editor wrapper
├── EditButton.tsx             # Edit trigger button
├── SaveCancelButtons.tsx      # Inline save/cancel controls
└── index.ts                   # Barrel exports
```

### Enhanced Existing Components

```
src/components/features/phases/SinglePhase/components/
├── PhaseMetadata.tsx          # Add inline editing
├── PhaseDescription.tsx       # Add modal editing
├── PhaseProgress.tsx          # Add inline editing
├── PhaseCheckpoints.tsx       # Add inline editing
├── PhaseMilestones.tsx        # Add inline editing
└── PhaseOutcomes.tsx          # Add modal editing
```

## State Management

### Editing State Hook

```typescript
// hooks/usePhaseEditing.ts
interface EditingState {
  isEditing: boolean
  editingData: Partial<Phase> | null
  isSaving: boolean
  errors: Record<string, string>
}

const usePhaseEditing = (phaseId: string) => {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    editingData: null,
    isSaving: false,
    errors: {}
  })
  
  const startEditing = (field?: keyof Phase) => {
    setEditingState(prev => ({
      ...prev,
      isEditing: true,
      editingData: field ? { [field]: phase[field] } : phase
    }))
  }
  
  const saveChanges = async (data: Partial<Phase>) => {
    setEditingState(prev => ({ ...prev, isSaving: true }))
    
    try {
      await updatePhase(phaseId, data)
      setEditingState(prev => ({ ...prev, isEditing: false, editingData: null }))
      queryClient.invalidateQueries(['phase', phaseId])
    } catch (error) {
      setEditingState(prev => ({ 
        ...prev, 
        errors: { general: error.message } 
      }))
    } finally {
      setEditingState(prev => ({ ...prev, isSaving: false }))
    }
  }
  
  const cancelEditing = () => {
    setEditingState(prev => ({
      ...prev,
      isEditing: false,
      editingData: null,
      errors: {}
    }))
  }
  
  return {
    editingState,
    startEditing,
    saveChanges,
    cancelEditing
  }
}
```

### Validation Schemas

```typescript
// schemas/phaseValidation.ts
import { z } from 'zod'

export const PhaseUpdateSchema = z.object({
  phase_name: z.string().min(1, 'Phase name is required').max(100),
  start_week: z.number().min(1).max(52),
  end_week: z.number().min(1).max(52),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  description: z.string().optional(),
  success_criteria: z.string().optional(),
  constraints_notes: z.string().optional()
})

export const PhaseFieldSchema = {
  phase_name: z.string().min(1, 'Phase name is required'),
  start_week: z.number().min(1, 'Start week must be 1-52'),
  end_week: z.number().min(1, 'End week must be 1-52'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date')
}
```

## User Experience Patterns

### 1. Inline Editing UX

**Trigger Actions:**
- Click on editable field
- Hover to show edit icon
- Keyboard shortcut (e.g., Enter)

**Save Actions:**
- Enter key
- Save button
- Click outside (with confirmation)

**Cancel Actions:**
- Escape key
- Cancel button
- Click outside (with confirmation)

### 2. Modal Editing UX

**Opening:**
- Click edit button
- Consistent modal positioning
- Preserve scroll position

**Content:**
- Full-screen editing experience
- Rich text toolbar
- Auto-save indicators

**Closing:**
- Save and close
- Cancel with unsaved changes warning
- Keyboard shortcuts

### 3. Visual Feedback

**Editing States:**
- Hover effects on editable fields
- Focus states for active editing
- Loading states during save
- Success/error notifications

**Accessibility:**
- ARIA labels for editing states
- Keyboard navigation
- Screen reader support
- Focus management

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up TipTap editor
- [ ] Create base editing components
- [ ] Implement editing state hook
- [ ] Add validation schemas

### Phase 2: Inline Editing (Week 2)
- [ ] EditableText component
- [ ] EditableNumber component
- [ ] EditableDate component
- [ ] Integrate with PhaseMetadata

### Phase 3: Modal Editing (Week 3)
- [ ] RichTextModal component
- [ ] TipTapEditor wrapper
- [ ] Integrate with PhaseDescription
- [ ] Add auto-save functionality

### Phase 4: Polish & Testing (Week 4)
- [ ] Error handling
- [ ] Loading states
- [ ] Accessibility improvements
- [ ] Unit and integration tests

## Technical Considerations

### Performance
- **Debounced saves** for rich text content
- **Optimistic updates** for immediate feedback
- **Lazy loading** of rich text editor
- **Memoization** of expensive components

### Data Consistency
- **Real-time validation** during editing
- **Conflict resolution** for concurrent edits
- **Rollback mechanisms** for failed saves
- **Cache invalidation** strategies

### Security
- **Input sanitization** for rich text content
- **XSS prevention** in editor output
- **Permission checks** before editing
- **Audit logging** for changes

### Accessibility
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** during editing
- **ARIA attributes** for editing states

## Testing Strategy

### Unit Tests
- **Component rendering** in different states
- **User interactions** (click, type, save, cancel)
- **Validation logic** for different field types
- **Error handling** scenarios

### Integration Tests
- **Editing workflow** from start to finish
- **Data persistence** and retrieval
- **State synchronization** between components
- **Modal interactions** and focus management

### E2E Tests
- **Complete editing scenarios** for each field type
- **Cross-browser compatibility**
- **Mobile responsiveness**
- **Performance benchmarks**

## Conclusion

This hybrid editing approach provides the best balance of user experience and technical maintainability. By implementing inline editing for simple fields and modal editing for rich content, we create an intuitive interface that scales with content complexity.

The phased implementation approach allows for iterative development and testing, ensuring each component works correctly before moving to the next phase. The use of modern tools like TipTap, React Hook Form, and Zod provides a solid foundation for building robust editing functionality.

## Future Enhancements

- **Collaborative editing** with real-time updates
- **Version history** and change tracking
- **Advanced rich text features** (tables, code blocks, etc.)
- **Bulk editing** for multiple phases
- **Template system** for common phase structures
- **Export functionality** for edited content
