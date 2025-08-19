# Smart Search Implementation

## Overview

The Smart Search feature provides a unified, intelligent search experience across all major entities in the VP Product Onboarding Management application. Users can search for people, meetings, tasks, and phases from the header search box with real-time results and smart relevance ranking.

## Features

### Core Functionality
- **Unified Search**: Single search input that searches across all entity types
- **Real-time Search**: 300ms debounced search with instant results
- **Smart Relevance Scoring**: Results ranked by match quality and context
- **Cross-entity Relationships**: Finding a person also shows their associated tasks and meetings
- **Keyboard Navigation**: Full arrow key navigation with Enter to select and Esc to close
- **Visual Highlighting**: Search terms are highlighted in results

### Search Scope
- **People**: First name, last name, role title, email
- **Meetings**: Meeting name, type, phase, attendee names
- **Tasks**: Task name, description, owner name, phase name
- **Phases**: Phase name, description

## Technical Implementation

### File Structure
```
src/
├── hooks/
│   └── useGlobalSearch.ts              # Main search hook with relevance scoring
├── components/layout/Header/
│   ├── SearchBox.tsx                   # Main search input component
│   ├── SearchDropdown.tsx              # Results dropdown container
│   └── SearchResultItem.tsx            # Individual result display
└── components/layout/
    └── Header.tsx                      # Updated to use SearchBox
```

### Core Hook: `useGlobalSearch.ts`

#### Search Result Type Definition
```typescript
export type SearchResultType = 'person' | 'meeting' | 'task' | 'phase';

export interface SearchResult {
  id: string;                    // Unique identifier (e.g., "person-123")
  type: SearchResultType;        // Entity type for UI grouping
  title: string;                 // Primary display text
  subtitle: string;              // Secondary display text
  context?: string;              // Additional context information
  data: Person | Meeting | Task | Phase; // Full entity data
  relevance: number;             // Relevance score (0-100)
}
```

#### Relevance Scoring Algorithm
The search uses a multi-tier relevance scoring system:

1. **Exact Match**: 100 points (90 for non-primary fields)
2. **Starts With**: 80 points (70 for non-primary fields) 
3. **Contains**: 60 points (50 for non-primary fields)
4. **Fuzzy Word Match**: 30 points (word boundary matching)

Primary fields (names, titles) get higher scores than secondary fields (descriptions, contexts).

#### Data Fetching Strategy
- Leverages existing hooks: `usePeople()`, `usePhases()`, `useTasks()`, `useMeetings()`
- Meetings are limited to current month to avoid loading excessive data
- All searches are performed client-side on pre-loaded data for instant results
- Results are memoized and re-calculated only when query or data changes

### UI Components

#### SearchBox Component
- **Input Management**: Handles query state with debouncing
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Focus Management**: Auto-opens dropdown on focus if query exists
- **Click Outside**: Closes dropdown when clicking elsewhere
- **Clear Functionality**: X button to clear search

Key State Management:
```typescript
const [query, setQuery] = useState('');           // Current input
const [debouncedQuery, setDebouncedQuery] = useState(''); // Debounced for search
const [isOpen, setIsOpen] = useState(false);      // Dropdown visibility
const [selectedIndex, setSelectedIndex] = useState(-1);   // Keyboard selection
```

#### SearchDropdown Component
- **Grouped Display**: Results grouped by entity type with headers
- **Limiting**: Shows max 5 results per type with "show more" indicator
- **Empty State**: Helpful message when no results found
- **Usage Tips**: Footer with keyboard shortcut hints

#### SearchResultItem Component
- **Highlight Matching**: Bold highlighting of search terms in results
- **Type Icons**: Visual icons for each entity type (User, Calendar, CheckSquare, Target)
- **Hierarchical Info**: Title, subtitle, and context displayed clearly
- **Selection State**: Visual indication of keyboard-selected item

## Search Behavior Details

### Query Processing
- Minimum 2 characters required to trigger search
- Case-insensitive matching
- Trims whitespace automatically
- Supports multi-word queries with fuzzy matching

### Result Ranking Logic
Results are sorted by relevance score (highest first), ensuring:
1. Exact name matches appear first
2. Partial name matches follow
3. Description/context matches come last
4. Related items (tasks of found people) have lower scores

### Cross-Entity Relationships
When searching finds entities, related items are automatically included:
- **Person Found**: Shows their assigned tasks and meetings they attend
- **Meeting Found**: Highlights attendees and related phase
- **Task Found**: Shows owner and associated phase context

### Performance Optimizations
- **Client-side Search**: No API calls during search typing
- **Debounced Input**: 300ms delay prevents excessive processing
- **Memoized Results**: Results cached until query or data changes  
- **Limited Results**: Max 20 total results to prevent UI overload
- **Efficient Rendering**: Virtual scrolling ready for large result sets

## Future Enhancements

### Planned Features
1. **Navigation Integration**: Click-to-navigate to entity detail pages
2. **Search History**: Recent searches persistence
3. **Advanced Filters**: Type-specific filtering options
4. **Bookmarks**: Save frequent searches
5. **Search Analytics**: Track popular searches for UX improvements

### Technical Improvements
1. **Server-side Search**: For larger datasets, implement backend search
2. **Search Indexing**: Pre-build search indices for faster matching
3. **Fuzzy Matching**: Implement Levenshtein distance for better fuzzy search
4. **Context Awareness**: Boost results based on current page context

## Integration Points

### Dependencies
- `@tanstack/react-query`: For data fetching and caching
- `date-fns`: For date range calculations in meeting queries
- `lucide-react`: For search and entity type icons
- Existing entity hooks: `usePeople`, `usePhases`, `useTasks`, `useMeetings`

### Data Requirements
The search requires the following data to be available:
- **People**: person_id, first_name, last_name, role_title, email
- **Meetings**: meeting_id, meeting_name, meeting_type, phase_name, attendees[]
- **Tasks**: task_id, task_name, description, owner_name, phase_name, status
- **Phases**: phase_id, phase_name, description, start_week, end_week

### Configuration
Search behavior can be customized via constants in `useGlobalSearch.ts`:
- `DEBOUNCE_DELAY`: Input debouncing time (default: 300ms)
- `MIN_QUERY_LENGTH`: Minimum characters to trigger search (default: 2)
- `MAX_RESULTS`: Maximum total results displayed (default: 20)
- `MAX_RESULTS_PER_TYPE`: Maximum results per entity type (default: 5)

## Usage Examples

### Basic Search
- Type "John" → Shows John Doe + his tasks + meetings he attends
- Type "Product Review" → Shows meetings with that name + related tasks + phase context
- Type "engineering@" → Shows all people with engineering email addresses

### Keyboard Navigation
1. Type search query (minimum 2 characters)
2. Use ↑/↓ arrow keys to navigate results
3. Press Enter to select highlighted result
4. Press Esc to close dropdown
5. Click X or clear input to reset search

### Result Interpretation
Each result shows:
- **Title**: Primary entity name (highlighted)
- **Subtitle**: Role, type, or owner information
- **Context**: Additional details like phase, status, attendee count
- **Type Badge**: Visual indicator of entity type

This implementation provides a comprehensive, performant search solution that enhances user productivity by making all application data easily discoverable through a single, intelligent interface.

## MIssing
Add search and details pages so the search can lead to the relevant data objects.