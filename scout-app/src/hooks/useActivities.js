import { useState, useCallback, useRef, useEffect } from 'react';

export default function useActivities() {
  const [activities, setActivities] = useState([]);
  const activitiesRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  const fetchedCarpoolsRef = useRef(new Set());
  const [fetchingCarpools, setFetchingCarpools] = useState(false);

  const fetchCarpoolsForActivity = useCallback(async (activityId, options = { force: false }) => {
    const { force } = options;
    if (fetchedCarpoolsRef.current.has(activityId) && !force) {
      const existing = activitiesRef.current.find((a) => a.activity_id === activityId);
      return existing?.carpools || [];
    }

    setFetchingCarpools(true);
    try {
      const resp = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Failed to fetch carpools');
      const data = await resp.json();
      const carpools = data.carpools || [];
      setActivities((prev) =>
        prev.map((a) =>
          a.activity_id === activityId ? { ...a, carpools } : a
        )
      );
      fetchedCarpoolsRef.current.add(activityId);
      return carpools;
    } finally {
      setFetchingCarpools(false);
    }
  }, []);

  const fetchActivities = useCallback(async (filterByRole = true) => {
    setLoading(true);
    setError(null);
    try {
      const apiEndpoint = filterByRole
        ? '/api/protected/activity/by_role'
        : '/api/protected/activity/no_role';

      const resp = await fetch(apiEndpoint, { credentials: 'include' });
      if (!resp.ok) throw new Error('Failed to fetch activities');
      const data = await resp.json();
      const sorted = (data.events || []).sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));

      // prime activities w/o carpools
      setActivities(sorted.map((a) => ({ ...a, carpools: a.carpools || [] })));

      // fetch carpools for each activity (hook's internal caching will dedupe)
      await Promise.all(
        sorted.map(async (a) => {
          try {
            await fetchCarpoolsForActivity(a.activity_id);
          } catch (e) {
            console.error(`Failed to fetch carpools for activity ${a.activity_id}`, e);
          }
        })
      );
    } catch (err) {
      console.error('fetchActivities error', err);
      setError(err.message || 'Error fetching activities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCarpoolsForActivity]);

  const checkIfAllChildrenJoined = useCallback(async (carpoolId) => {
    try {
      const resp = await fetch(`/api/carpool/all-children-joined?carpool_id=${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await resp.json();
      return resp.ok && data.all_children_joined && data.user_already_joined;
    } catch (err) {
      console.error('checkIfAllChildrenJoined error', err);
      return false;
    }
  }, []);

  const deleteCarpool = useCallback(async (carpoolId, activityId) => {
    try {
      const resp = await fetch(`/api/carpool/${carpoolId}/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resp.ok) throw new Error('Failed to delete carpool');
      // remove from activities state
      setActivities((prev) =>
        prev.map((a) =>
          a.activity_id === activityId
            ? { ...a, carpools: (a.carpools || []).filter((c) => c.id !== carpoolId) }
            : a
        )
      );
      // remove cache entry so future fetches will refetch
      fetchedCarpoolsRef.current.delete(activityId);
      return true;
    } catch (err) {
      console.error('deleteCarpool error', err);
      throw err;
    }
  }, []);

  const addPassenger = useCallback(async (payload, activityId) => {
    try {
      const resp = await fetch(`/api/carpool/add-passenger`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Failed to add passenger');
      // refresh carpools for the activity (force)
      if (activityId) await fetchCarpoolsForActivity(activityId, { force: true });
      return await resp.json();
    } catch (err) {
      console.error('addPassenger error', err);
      throw err;
    }
  }, [fetchCarpoolsForActivity]);

  const selectJoin = useCallback(async (carpoolId) => {
    try {
      const resp = await fetch(`/api/carpool/select-join?carpool_id=${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Failed to fetch participants');
      return await resp.json();
    } catch (err) {
      console.error('selectJoin error', err);
      throw err;
    }
  }, []);

  return {
    activities,
    setActivities,
    fetchActivities,
    fetchCarpoolsForActivity,
    checkIfAllChildrenJoined,
    deleteCarpool,
    addPassenger,
    selectJoin,
    loading,
    error,
    // new export:
    fetchingCarpools,
  };
}