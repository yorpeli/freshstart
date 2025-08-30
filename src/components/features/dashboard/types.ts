export interface DashboardState {
  timeRange: '1w' | '1m' | '3m';
  focusArea: WorkstreamType | 'all';
  widgetLayout: WidgetConfig[];
  refreshInterval: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
  isVisible: boolean;
  settings?: Record<string, unknown>;
}

export type WidgetType = 
  | 'executive-summary'
  | 'phase-progress'
  | 'workstream-status'
  | 'team-momentum'
  | 'stakeholder-engagement'
  | 'meeting-roi'
  | 'initiatives-pipeline';

export type WorkstreamType = 'Product' | 'Process' | 'People' | 'Partnerships';

export interface ExecutiveSummaryData {
  currentPhase: {
    name: string;
    progress: number;
    riskLevel: 'low' | 'medium' | 'high';
    nextMilestone: string;
  };
  nextPhase?: {
    name: string;
    startDate: string;
  };
  teamHealth: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    factors: {
      morale: number;
      velocity: number;
      capacity: number;
    };
  };
  liberationWins: {
    count: number;
    recent: string[];
    trend: 'up' | 'down' | 'stable';
  };
  confidenceMeter: {
    overall: number;
    stakeholders: {
      department: string;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }[];
  };
}

export interface PhaseProgressData {
  learningPercentage: number;
  valuePercentage: number;
  riskFlags: RiskFlag[];
  timeline: TimelineEvent[];
  nextActions: NextAction[];
}

export interface RiskFlag {
  id: string;
  type: 'schedule' | 'blocker' | 'dependency' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'at-risk';
  description?: string;
}

export interface NextAction {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  estimatedEffort?: string;
}

export interface WorkstreamHealth {
  workstreamId: string;
  name: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  blockedItems: BlockedItem[];
  quickWins: QuickWin[];
  dependencies: Dependency[];
}

export interface BlockedItem {
  id: string;
  title: string;
  blocker: string;
  blockedSince: string;
  impact: 'low' | 'medium' | 'high';
  unblockActions: string[];
}

export interface QuickWin {
  id: string;
  title: string;
  estimatedROI: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface Dependency {
  id: string;
  fromWorkstream: string;
  toWorkstream: string;
  description: string;
  status: 'waiting' | 'in-progress' | 'resolved';
  criticality: 'low' | 'medium' | 'high';
}

export interface TeamMomentumData {
  velocity: {
    current: number;
    trend: number[];
    cycleTime: number;
  };
  sentiment: {
    overall: number;
    recent: SentimentDataPoint[];
    insights: string[];
  };
  capacity: {
    available: number;
    utilized: number;
    upcoming: number;
  };
  growthAreas: GrowthArea[];
}

export interface SentimentDataPoint {
  date: string;
  score: number;
  source: 'survey' | '1:1' | 'retro';
}

export interface GrowthArea {
  id: string;
  area: string;
  priority: 'high' | 'medium' | 'low';
  people: string[];
  suggestedActions: string[];
}

export interface StakeholderEngagementData {
  responseRate: {
    email: number;
    meetings: number;
    trend: 'up' | 'down' | 'stable';
  };
  relationshipHealth: {
    department: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    lastInteraction: string;
  }[];
  partnershipOpportunities: Partnership[];
  communicationEffectiveness: {
    feedbackLoops: number;
    responseTime: number;
    clarityScore: number;
  };
}

export interface Partnership {
  id: string;
  department: string;
  opportunity: string;
  potential: 'high' | 'medium' | 'low';
  nextSteps: string[];
}

export interface MeetingROIData {
  actionItemCompletion: {
    rate: number;
    byMeetingType: { type: string; rate: number }[];
  };
  decisionVelocity: {
    averageTime: number;
    trend: 'up' | 'down' | 'stable';
  };
  participantEngagement: {
    attendance: number;
    contribution: number;
    satisfaction: number;
  };
  effectiveness: {
    score: number;
    improvements: string[];
  };
}