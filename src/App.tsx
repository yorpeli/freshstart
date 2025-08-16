
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import DashboardView from './components/views/DashboardView';
import PhasesView from './components/views/PhasesViewNew';
import SinglePhaseView from './components/views/SinglePhaseView';
import TasksView from './components/views/TasksView';
import MeetingsView from './components/views/MeetingsView';
import WorkstreamsView from './components/views/WorkstreamsView';
import PeopleView from './components/views/PeopleView';
import DepartmentsView from './components/views/DepartmentsView';
import MeetingTypesView from './components/views/MeetingTypesView';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/phases" element={<PhasesView />} />
            <Route path="/phases/:id" element={<SinglePhaseView />} />
            <Route path="/tasks" element={
              <ErrorBoundary>
                <TasksView />
              </ErrorBoundary>
            } />
            <Route path="/meetings" element={
              <ErrorBoundary>
                <MeetingsView />
              </ErrorBoundary>
            } />
            <Route path="/workstreams" element={
              <ErrorBoundary>
                <WorkstreamsView />
              </ErrorBoundary>
            } />
            <Route path="/people" element={<PeopleView />} />
            <Route path="/departments" element={<DepartmentsView />} />
            <Route path="/meeting-types" element={<MeetingTypesView />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
