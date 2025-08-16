# VP Product Onboarding Management Platform

A modern SaaS application for managing VP Product onboarding plans, built with React 18, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Dashboard Overview**: Comprehensive view of onboarding progress and key metrics
- **Phase Management**: Track learning and value progress across different onboarding phases
- **Workstream Tracking**: Manage Product, Process, People, and Partnerships workstreams
- **Team Management**: Hierarchical view of team structure with reporting relationships
- **Department Overview**: Monitor team sizes and organizational structure
- **Meeting Templates**: Rich JSONB templates for different meeting types

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with the required database schema

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd freshstart
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://kesfmdnzvlcmlqofhyjp.supabase.co
VITE_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlc2ZtZG56dmxjbWxxb2ZoeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTk3MTgsImV4cCI6MjA3MDY5NTcxOH0.7mr_leHTmSt24ILUFfLxgjfBlkcOMC4o40L-6UL5m3Y'
```

**Important**: You need to get the actual anon key from your Supabase project dashboard.

### 3. Database Schema

The application expects the following tables to exist in your Supabase database:

- `phases` - Onboarding phases with progress tracking
- `workstreams` - Different work areas (Product, Process, People, Partnerships)
- `people` - Team members with reporting relationships
- `departments` - Organizational departments
- `meeting_types` - Meeting templates with JSONB structure

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header, Layout)
│   ├── ui/             # Reusable UI components (Badge, Card, Table, Modal)
│   └── views/          # Page-specific view components
├── hooks/              # Custom hooks for data fetching
├── lib/                # Utilities, types, and Supabase client
└── App.tsx            # Main application component
```

## 🎨 Design System

- **Color Palette**: Professional SaaS aesthetic with workstream-specific colors
- **Typography**: Inter font family for clean, modern appearance
- **Spacing**: Consistent spacing using Tailwind's design system
- **Components**: Card-based layouts with subtle shadows and borders

## 📱 Responsive Design

- Desktop-first approach with mobile-friendly responsive design
- Sidebar navigation that adapts to different screen sizes
- Tables with horizontal scrolling on smaller devices

## 🔌 Data Management

- **TanStack Query**: Server state management with caching and synchronization
- **Supabase Integration**: Real-time database connectivity
- **Type Safety**: Full TypeScript support with generated types
- **Error Handling**: Graceful error states and loading indicators

## 🚧 Current Status

This is a **read-only V1** implementation focusing on:
- ✅ Clean data display for all database entities
- ✅ Professional UI/UX design
- ✅ Responsive layout and navigation
- ✅ Loading states and error handling
- ✅ Type-safe implementation

## 🔮 Future Enhancements

- [ ] CRUD operations for all entities
- [ ] Meeting scheduling and management
- [ ] Progress tracking dashboards
- [ ] Real-time updates
- [ ] Advanced filtering and search
- [ ] Gantt charts for project timelines
- [ ] User authentication and permissions
- [ ] Export functionality

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**: Verify your Supabase credentials in `.env.local`
2. **Missing Tables**: Ensure all required database tables exist
3. **Type Errors**: Run `npm run build` to check for TypeScript issues

### Getting Help

- Check the browser console for error messages
- Verify your Supabase project is active and accessible
- Ensure all environment variables are properly set

## 📄 License

This project is built for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project, but feedback and suggestions are welcome!

---

**Built with ❤️ using modern web technologies**
