import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Phase } from '../lib/types';

interface EditingState {
  isEditing: boolean;
  editingData: Partial<Phase> | null;
  isSaving: boolean;
  errors: Record<string, string>;
}

interface UsePhaseEditingReturn {
  editingState: EditingState;
  startEditing: (field?: keyof Phase) => void;
  saveChanges: (data: Partial<Phase>) => Promise<void>;
  cancelEditing: () => void;
  updateField: (field: keyof Phase, value: any) => void;
}

const usePhaseEditing = (phaseId: string, phase: Phase): UsePhaseEditingReturn => {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    editingData: null,
    isSaving: false,
    errors: {}
  });

  const queryClient = useQueryClient();

  const startEditing = (field?: keyof Phase) => {
    setEditingState(prev => ({
      ...prev,
      isEditing: true,
      editingData: field ? { [field]: phase[field] } : { ...phase }
    }));
  };

  const updateField = (field: keyof Phase, value: any) => {
    setEditingState(prev => ({
      ...prev,
      editingData: prev.editingData ? { ...prev.editingData, [field]: value } : { [field]: value }
    }));
  };

  const saveChanges = async (data: Partial<Phase>) => {
    setEditingState(prev => ({ ...prev, isSaving: true, errors: {} }));
    
    try {
      // TODO: Implement actual API call
      // await updatePhase(phaseId, data);
      
      // For now, just simulate the update
      console.log('Saving phase changes:', data);
      
      // Optimistic update
      queryClient.setQueryData(['phase', phaseId], (oldData: Phase | undefined) => {
        if (oldData) {
          return { ...oldData, ...data };
        }
        return oldData;
      });
      
      setEditingState(prev => ({ 
        ...prev, 
        isEditing: false, 
        editingData: null,
        isSaving: false 
      }));
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      
    } catch (error) {
      setEditingState(prev => ({ 
        ...prev, 
        errors: { general: error instanceof Error ? error.message : 'Failed to save changes' },
        isSaving: false
      }));
    }
  };

  const cancelEditing = () => {
    setEditingState(prev => ({
      ...prev,
      isEditing: false,
      editingData: null,
      errors: {}
    }));
  };

  return {
    editingState,
    startEditing,
    saveChanges,
    cancelEditing,
    updateField
  };
};

export default usePhaseEditing;
