export const fetchActivitiesByRole = async () => {
    const response = await fetch('/api/protected/activity/by_role', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch activities by role');
    return response.json();
  };
  
  export const fetchAllVisibleActivities = async () => {
    const response = await fetch('/api/protected/activity/no_role', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch all visible activities');
    return response.json();
  };