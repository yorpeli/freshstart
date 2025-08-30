import { useQuery } from '@tanstack/react-query';
import { usePhases, useWorkstreams, usePeopleWithRelations } from '../../../../hooks/useSupabaseQuery';
import type { ExecutiveSummaryData } from '../types';

export const useExecutiveDashboard = () => {
  const { data: phases } = usePhases();
  const { data: workstreams } = useWorkstreams();
  const { data: people } = usePeopleWithRelations();

  // Orchestrate all dashboard data
  return useQuery({
    queryKey: ['executive-dashboard', phases?.length, workstreams?.length, people?.length],
    queryFn: async (): Promise<{
      executiveSummary: ExecutiveSummaryData;
      isLoading: boolean;
      error: string | null;
    }> => {
      if (!phases || !workstreams || !people) {
        throw new Error('Required data not loaded');
      }

      // Calculate current and next phase
      const now = new Date();
      const currentPhase = phases.find(phase => {
        const start = new Date(phase.start_date);
        const end = new Date(phase.end_date);
        return now >= start && now <= end;
      }) || phases[0]; // Fallback to first phase

      const currentIndex = phases.findIndex(p => p.phase_id === currentPhase?.phase_id);
      const nextPhase = currentIndex >= 0 && currentIndex < phases.length - 1 ? phases[currentIndex + 1] : undefined;

      // Calculate risk level based on progress and timeline
      const getRiskLevel = (phase: typeof currentPhase): 'low' | 'medium' | 'high' => {
        if (!phase) return 'low';
        const progress = (phase.learning_percentage + phase.value_percentage) / 2;
        const timeElapsed = (now.getTime() - new Date(phase.start_date).getTime()) / 
                           (new Date(phase.end_date).getTime() - new Date(phase.start_date).getTime());
        
        if (timeElapsed > 0.8 && progress < 60) return 'high';
        if (timeElapsed > 0.6 && progress < 40) return 'medium';
        return 'low';
      };

      // Calculate team health (mock calculation - would integrate with real metrics)
      const teamHealth = {
        score: 78, // Mock score
        trend: 'up' as const,
        factors: {
          morale: 80,
          velocity: 75,
          capacity: 85
        }
      };

      // Calculate liberation wins (mock data - would come from completed blockers)
      const liberationWins = {
        count: 12,
        recent: [
          'Unblocked API integration with Legal approval',
          'Resolved dependency on Platform team',
          'Got stakeholder alignment on Q4 goals'
        ],
        trend: 'up' as const
      };

      // Calculate confidence meter (mock data - would come from stakeholder surveys)
      const confidenceMeter = {
        overall: 82,
        stakeholders: [
          { department: 'Engineering', confidence: 85, trend: 'up' as const },
          { department: 'Legal', confidence: 78, trend: 'stable' as const },
          { department: 'Finance', confidence: 80, trend: 'up' as const },
          { department: 'Product', confidence: 88, trend: 'up' as const }
        ]
      };

      const executiveSummary: ExecutiveSummaryData = {
        currentPhase: {
          name: currentPhase?.phase_name || 'Unknown Phase',
          progress: currentPhase ? Math.round((currentPhase.learning_percentage + currentPhase.value_percentage) / 2) : 0,
          riskLevel: getRiskLevel(currentPhase),
          nextMilestone: 'Strategic Positioning Review' // Mock data
        },
        nextPhase: nextPhase ? {
          name: nextPhase.phase_name,
          startDate: nextPhase.start_date
        } : undefined,
        teamHealth,
        liberationWins,
        confidenceMeter
      };

      return {
        executiveSummary,
        isLoading: false,
        error: null
      };
    },
    enabled: !!phases && !!workstreams && !!people,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for executive data
    retry: 1,
  });
};

export default useExecutiveDashboard;