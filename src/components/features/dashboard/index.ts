import DashboardRoot from './components/DashboardRoot';
import DashboardHero from './components/DashboardHero';
import DashboardGrid from './components/DashboardGrid';
import DashboardSection from './components/DashboardSection';
import DashboardWidget from './components/DashboardWidget';

// Compound component system
export const Dashboard = {
  Root: DashboardRoot,
  Hero: DashboardHero,
  Grid: DashboardGrid,
  Section: DashboardSection,
  Widget: DashboardWidget,
};

// Export individual components
export { DashboardRoot, DashboardHero, DashboardGrid, DashboardSection, DashboardWidget };

// Export types
export * from './types';

// Export main container
export { default as DashboardContainer } from './DashboardContainer';