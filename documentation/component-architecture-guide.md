# Component Architecture & Best Practices Guide

This document establishes the architectural patterns and best practices for building maintainable, reusable React components in the FreshStart project.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Organization](#component-organization)
3. [Component Types & Patterns](#component-types--patterns)
4. [State Management Strategy](#state-management-strategy)
5. [UI State Patterns](#ui-state-patterns)
6. [TypeScript Conventions](#typescript-conventions)
7. [File Organization](#file-organization)
8. [Component Breakdown Strategy](#component-breakdown-strategy)
9. [Reusability Guidelines](#reusability-guidelines)
10. [Testing Strategy](#testing-strategy)

## Core Principles

### Single Responsibility Principle
Each component should have one clear responsibility. If you need "and" to describe what a component does, it likely violates SRP.

**Good Example:**
- `UserProfile` - Displays user information
- `UserProfileEditor` - Handles user profile editing

**Bad Example:**
- `UserProfileAndEditor` - Displays and edits user information

### Composition Over Inheritance
Use component composition to build complex UIs from simpler components.

```typescript
// Good: Composition
<Card>
  <CardHeader>
    <CardTitle>Phase 1</CardTitle>
    <CardBadge>Week 1-2</CardBadge>
  </CardHeader>
  <CardContent>
    <ProgressBar value={75} />
  </CardContent>
</Card>

// Avoid: Monolithic component with many props
<PhaseCard 
  title="Phase 1" 
  badge="Week 1-2" 
  progress={75}
  showHeader={true}
  showProgress={true}
  // ... many more props
/>
```

### Separation of Concerns
Separate data fetching, business logic, and presentation concerns.

## Component Organization

### Directory Structure
```
src/components/
├── ui/                     # Base UI components (Button, Card, Badge)
├── layout/                 # Layout components (Header, Sidebar)
├── features/              # Feature-specific components
│   ├── phases/
│   │   ├── PhaseCard/
│   │   │   ├── PhaseCard.tsx
│   │   │   ├── PhaseCard.test.tsx
│   │   │   ├── components/     # Sub-components
│   │   │   │   ├── PhaseHeader.tsx
│   │   │   │   ├── PhaseProgressBar.tsx
│   │   │   │   └── PhaseStatus.tsx
│   │   │   └── index.ts
│   │   ├── PhasesList/
│   │   └── hooks/
│   │       └── usePhases.ts
│   ├── workstreams/
│   └── people/
├── shared/                # Shared components across features
└── views/                 # Page-level view components
```

## Component Types & Patterns

### 1. Presentational Components
Pure components focused on rendering UI. Receive data via props.

```typescript
interface UserCardProps {
  user: User;
  className?: string;
  variant?: 'compact' | 'detailed';
}

const UserCard: React.FC<UserCardProps> = ({ user, className = '', variant = 'detailed' }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <h3>{user.name}</h3>
        {variant === 'detailed' && <p>{user.email}</p>}
      </CardHeader>
    </Card>
  );
};
```

### 2. Container Components
Handle data fetching and state management. Delegate rendering to presentational components.

```typescript
const UserProfileContainer: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);
  
  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!user) return <EmptyState message="User not found" />;
  
  return <UserProfile user={user} />;
};
```

### 3. Compound Components
Related components that share state and work together.

```typescript
const PhaseCard = {
  Root: PhaseCardRoot,
  Header: PhaseHeader,
  Timeline: PhaseTimeline,
  Progress: PhaseProgress,
  Status: PhaseStatus,
};

// Usage
<PhaseCard.Root>
  <PhaseCard.Header title="Phase 1" week="1-2" />
  <PhaseCard.Timeline startDate="2024-01-01" endDate="2024-01-15" />
  <PhaseCard.Progress type="learning" value={75} />
  <PhaseCard.Progress type="value" value={60} />
  <PhaseCard.Status badges={['Learning Complete']} />
</PhaseCard.Root>
```

## State Management Strategy

### Local State (useState)
Use for component-specific state that doesn't need to be shared.

```typescript
const [isExpanded, setIsExpanded] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');
```

### Server State (TanStack Query)
Use for all API data. Extract into custom hooks.

```typescript
// Custom hook for data fetching
const usePhases = () => {
  return useQuery({
    queryKey: ['phases'],
    queryFn: () => phasesService.getPhases(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Complex State (useReducer)
Use for complex state logic with multiple related values.

```typescript
interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'RESET_FILTERS':
      return initialFilterState;
    default:
      return state;
  }
};
```

## UI State Patterns

Every data-driven component must handle these four states:

### 1. Loading State
Use skeleton components instead of spinners for better UX.

```typescript
const PhasesSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <div className="bg-gray-200 h-6 rounded mb-4"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
        <div className="bg-gray-200 h-20 rounded mb-4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </Card>
    ))}
  </div>
);
```

### 2. Error State
Provide actionable error messages with retry options.

```typescript
interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  title = "Something went wrong" 
}) => (
  <Card className="text-center py-12">
    <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </Card>
);
```

### 3. Empty State
Provide helpful guidance and next steps.

```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  action, 
  icon 
}) => (
  <Card className="text-center py-12">
    {icon && <div className="mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </Card>
);
```

### 4. Success State
The ideal state with data displayed properly.

## TypeScript Conventions

### Props Interfaces
Always define clear interfaces for component props.

```typescript
interface PhaseCardProps {
  phase: Phase;
  onEdit?: (phase: Phase) => void;
  onDelete?: (phaseId: number) => void;
  className?: string;
  variant?: 'compact' | 'detailed';
}
```

### Boolean Props
Use descriptive prefixes for boolean props.

```typescript
interface ButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  hasIcon?: boolean;
  shouldShowTooltip?: boolean;
}
```

### Union Types for Variants
Use union types for component variants and states.

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

## File Organization

### Component File Structure
```
PhaseCard/
├── PhaseCard.tsx           # Main component
├── PhaseCard.test.tsx      # Unit tests
├── PhaseCard.stories.tsx   # Storybook stories (optional)
├── components/             # Sub-components
│   ├── PhaseHeader.tsx
│   ├── PhaseProgressBar.tsx
│   └── PhaseStatus.tsx
├── hooks/                  # Component-specific hooks
│   └── usePhaseCard.ts
├── types.ts               # Component-specific types
└── index.ts               # Barrel export
```

### Barrel Exports
Use index.ts files as public APIs.

```typescript
// components/features/phases/index.ts
export { default as PhaseCard } from './PhaseCard';
export { default as PhasesList } from './PhasesList';
export { usePhases } from './hooks/usePhases';
export type { Phase, PhaseCardProps } from './types';
```

## Component Breakdown Strategy

### When to Break Down Components

Break down a component when:
- File exceeds 200-300 lines
- Component handles multiple concerns
- Parts can be reused elsewhere
- Testing becomes difficult
- Multiple developers work on the same component

### Breakdown Process

1. **Identify Responsibilities**: List what the component does
2. **Extract Sub-components**: Create smaller components for distinct UI sections
3. **Extract Custom Hooks**: Move data fetching and business logic to hooks
4. **Create Compound Components**: For related components that share state
5. **Test Incrementally**: Ensure each extraction maintains functionality

### Example: Breaking Down PhasesView

**Original Component Responsibilities:**
- Data fetching (phases)
- Loading state rendering
- Error state rendering  
- Empty state rendering
- Phase cards rendering
- Page layout and header

**Breakdown Strategy:**
```typescript
// 1. Extract UI state components
const PhasesLoading = () => <PhasesSkeleton />;
const PhasesError = ({ error }: { error: Error }) => <ErrorState error={error} />;
const PhasesEmpty = () => <EmptyState title="No Phases" />;

// 2. Extract complex sub-components
const PhaseCard = ({ phase }: { phase: Phase }) => { /* ... */ };

// 3. Create the container component
const PhasesContainer = () => {
  const { data: phases, isLoading, error } = usePhases();
  
  if (isLoading) return <PhasesLoading />;
  if (error) return <PhasesError error={error} />;
  if (!phases?.length) return <PhasesEmpty />;
  
  return <PhasesList phases={phases} />;
};

// 4. Create the view component (layout only)
const PhasesView = () => (
  <div className="p-6">
    <ViewHeader 
      title="Onboarding Phases"
      description="Track progress across all onboarding phases"
    />
    <PhasesContainer />
  </div>
);
```

## Reusability Guidelines

### Design for Reusability
- Use composition over configuration
- Accept minimal required props
- Provide sensible defaults
- Use render props or children for flexibility

```typescript
// Good: Flexible and reusable
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

// Usage
<DataList 
  data={phases}
  renderItem={(phase) => <PhaseCard phase={phase} />}
  emptyState={<EmptyState title="No phases found" />}
/>
```

### Create Base Components
Build a foundation of reusable base components.

```typescript
// Base components
const Card = ({ children, className, ...props }) => { /* ... */ };
const Button = ({ variant, size, children, ...props }) => { /* ... */ };
const Badge = ({ variant, children, ...props }) => { /* ... */ };

// Composed components
const PhaseCard = ({ phase }) => (
  <Card>
    <div className="flex justify-between">
      <h3>{phase.name}</h3>
      <Badge variant="outline">Week {phase.week}</Badge>
    </div>
  </Card>
);
```

## Testing Strategy

### Unit Testing Focus
- Test component props and rendering
- Test user interactions
- Test error boundaries
- Mock external dependencies

```typescript
// PhaseCard.test.tsx
describe('PhaseCard', () => {
  const mockPhase = {
    phase_id: 1,
    phase_name: 'Phase 1',
    learning_percentage: 75,
    value_percentage: 60,
    // ... other properties
  };

  it('renders phase information correctly', () => {
    render(<PhaseCard phase={mockPhase} />);
    
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<PhaseCard phase={mockPhase} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockPhase);
  });
});
```

### Integration Testing
Test component interaction and data flow.

```typescript
// PhasesView.test.tsx
describe('PhasesView', () => {
  it('displays loading state initially', () => {
    // Mock loading state
    render(<PhasesView />);
    expect(screen.getByTestId('phases-skeleton')).toBeInTheDocument();
  });

  it('displays phases when data is loaded', async () => {
    // Mock successful data fetch
    render(<PhasesView />);
    
    await waitFor(() => {
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Phase 2')).toBeInTheDocument();
    });
  });
});
```

## Conclusion

Following these patterns ensures:
- **Maintainability**: Clear separation of concerns and single responsibility
- **Reusability**: Composable components that work across features
- **Scalability**: Architecture that grows with your application
- **Developer Experience**: Consistent patterns and clear file organization
- **Type Safety**: Comprehensive TypeScript usage
- **Testing**: Testable components with clear boundaries

Remember: Start simple and refactor as complexity grows. Don't over-engineer early, but be ready to break down components when they become unwieldy.