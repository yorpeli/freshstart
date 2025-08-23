import { usePeopleWithRelations } from '../../../../hooks/useSupabaseQuery';

export const usePeopleData = () => {
  const { data: people, isLoading, error } = usePeopleWithRelations();

  return {
    people: people || [],
    isLoading,
    error
  };
};