import type { Workstream } from '../../../lib/types';

export interface WorkstreamCardProps {
  workstream: Workstream;
  className?: string;
  variant?: 'default' | 'compact';
}

export interface WorkstreamCategoriesProps {
  className?: string;
}

export interface WorkstreamGridProps {
  workstreams: Workstream[];
  className?: string;
}

export interface WorkstreamsContainerProps {
  className?: string;
}

export type WorkstreamPriority = 1 | 2 | 3;