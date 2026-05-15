import { useState, useCallback } from 'react';

const useLeaderActivities = (toast) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/protected/activity/all', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Något gick fel vid hämtning av aktiviteter');
      }

      const data = await response.json();
      const sortedActivities = data.events
        .map((activity) => ({
          ...activity,
          isVisible: activity.is_visible,
        }))
        .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCarpoolsForActivity = useCallback(async (activityId) => {
    setFetchingCarpools(true);
    try {
      const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setActivities((prevActivities) =>
          prevActivities.map((activity) => {
            if (activity.activity_id === activityId) {
              return { ...activity, carpools: data.carpools };
            }
            return activity;
          })
        );
      } else {
        throw new Error('Misslyckades med att hämta samåkningar');
      }
    } catch (error) {
      toast({
        title: 'Fel vid hämtning av samåkningar.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingCarpools(false);
    }
  }, [toast]);

  const toggleActivityVisibility = useCallback(async (activityId, isVisible) => {
    const endpoint = isVisible
      ? `/api/protected/activity/remove/${activityId}`
      : `/api/protected/activity/make_visible/${activityId}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Misslyckades med att uppdatera aktivitetens synlighet');
      }

      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.activity_id === activityId
            ? { ...activity, isVisible: !isVisible }
            : activity
        )
      );

      toast({
        title: `Aktiviteten har nu blivit ${!isVisible ? 'synlig' : 'dold'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ett fel uppstod vid ändring av synligheten.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  return {
    activities,
    loading,
    error,
    fetchingCarpools,
    fetchActivities,
    fetchCarpoolsForActivity,
    toggleActivityVisibility,
  };
};

export default useLeaderActivities;