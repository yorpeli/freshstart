import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs.Root');
  }
  return context;
};

// Root component that provides context
interface TabsRootProps {
  children: React.ReactNode;
  defaultTab?: string;
  className?: string;
}

const TabsRoot: React.FC<TabsRootProps> = ({ 
  children, 
  defaultTab = '', 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tab list component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Individual tab trigger
interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabTrigger: React.FC<TabTriggerProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`
        px-4 py-2 text-sm font-medium border-b-2 transition-colors
        ${isActive 
          ? 'text-blue-600 border-blue-600' 
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Tab content
interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabContent: React.FC<TabContentProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const { activeTab } = useTabsContext();
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={`mt-6 ${className}`}>
      {children}
    </div>
  );
};

// Compound component export
const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabTrigger,
  Content: TabContent,
};

export default Tabs;
