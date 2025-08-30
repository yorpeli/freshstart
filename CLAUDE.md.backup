# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Lint code:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```

**Install dependencies:**
```bash
npm install
```

## Architecture Overview

This is a React 18 + TypeScript SaaS application for VP Product onboarding management with the following stack:

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom workstream color palette
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

### Core Architecture Patterns

**Data Layer**: Uses TanStack Query with custom hooks in `src/hooks/useSupabaseQuery.ts` for all server state management. The application follows a read-only pattern with no CRUD operations implemented.

**Component Organization**:
- `src/components/layout/` - Layout components (Sidebar, Header, Layout)
- `src/components/ui/` - Reusable UI components (Badge, Card, Table, Modal, ErrorBoundary)
- `src/components/views/` - Page-specific view components for each route

**Type System**: Comprehensive TypeScript definitions in `src/lib/types.ts` with database entity types matching Supabase schema.

**Database Schema**: Application expects these Supabase tables:
- `phases` - Onboarding phases with learning/value progress tracking
- `workstreams` - Work areas (Product, Process, People, Partnerships) with priority and color coding
- `people` - Team members with hierarchical reporting relationships
- `departments` - Organizational departments
- `meeting_types` - Meeting templates with JSONB structure

### Key Implementation Details

**Supabase Integration**: Client setup in `src/lib/supabase.ts` includes connection testing, error handling, and table constants. Uses environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Data Relationships**: The `usePeopleWithRelations` hook demonstrates complex data joining, building manager-direct report relationships from the people table's self-referencing structure.

**Design System**: Custom Tailwind configuration with workstream-specific colors and Inter font family. Professional SaaS aesthetic with card-based layouts.

**Error Handling**: Centralized error handling with ErrorBoundary components and consistent error state management through TanStack Query.

## Environment Setup

Requires `.env.local` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing and Quality

The project uses ESLint with TypeScript ESLint configurations. Run type checking with the build command which includes `tsc -b` before building.