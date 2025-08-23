export interface PeopleFiltersState {
  searchQuery: string;
  departmentFilter: string;
  engagementFilter: string;
  sortBy: 'last_name' | 'first_name' | 'role_title' | 'department' | 'engagement_priority' | 'influence_level';
  sortOrder: 'asc' | 'desc';
}