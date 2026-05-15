import { useState, useEffect, useCallback } from 'react';

export default function useJoinedChildren(activities = [], checkIfAllChildrenJoined) {
  const [joinedChildrenInCarpool, setJoinedChildrenInCarpool] = useState({});

  const init = useCallback(async () => {
    const joinedStatus = {};
    for (const activity of activities) {
      if (!activity?.carpools) continue;
      for (const carpool of activity.carpools) {
        try {
          const allChildrenJoined = await checkIfAllChildrenJoined(carpool.id);
          joinedStatus[carpool.id] = { allJoined: !!allChildrenJoined };
        } catch (e) {
          joinedStatus[carpool.id] = { allJoined: false };
        }
      }
    }
    setJoinedChildrenInCarpool(joinedStatus);
  }, [activities, checkIfAllChildrenJoined]);

  useEffect(() => {
    if (!Array.isArray(activities) || activities.length === 0) return;
    init();
  }, [activities, init]);

  const refreshCarpoolJoinedStatus = useCallback(
    async (carpoolId) => {
      try {
        const allChildrenJoined = await checkIfAllChildrenJoined(carpoolId);
        setJoinedChildrenInCarpool((prev) => ({ ...prev, [carpoolId]: { allJoined: !!allChildrenJoined } }));
        return !!allChildrenJoined;
      } catch (e) {
        console.error('useJoinedChildren: refresh error', e);
        return false;
      }
    },
    [checkIfAllChildrenJoined]
  );

  return {
    joinedChildrenInCarpool,
    setJoinedChildrenInCarpool,
    refreshCarpoolJoinedStatus,
  };
}