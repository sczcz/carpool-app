import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

export default function useCarpoolModals({
  selectJoin,
  addPassenger,
  refreshCarpoolJoinedStatus,
}) {
  const toast = useToast();
  const [participants, setParticipants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJoinCarpoolId, setSelectedJoinCarpoolId] = useState(null);
  const [selectedJoinActivityId, setSelectedJoinActivityId] = useState(null);
  const [loadingJoinState, setLoadingJoinState] = useState({});

  const openJoinModal = useCallback(
    async (carpoolId, activityId) => {
      try {
        setLoadingJoinState((prev) => ({ ...prev, [carpoolId]: true }));
        const participantsData = await selectJoin(carpoolId);
        setParticipants(participantsData);
        setSelectedJoinCarpoolId(carpoolId);
        setSelectedJoinActivityId(activityId);
        setIsModalOpen(true);
      } catch (error) {
        toast({
          title: 'Fel',
          description:
            error?.message || 'Ett fel inträffade vid hämtning av deltagare.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoadingJoinState((prev) => ({ ...prev, [carpoolId]: false }));
      }
    },
    [selectJoin, toast]
  );

  const closeJoinModal = useCallback(() => {
    setIsModalOpen(false);
    setParticipants([]);
    setSelectedJoinCarpoolId(null);
    setSelectedJoinActivityId(null);
  }, []);

  const handleParticipantSelect = useCallback(
    async (participant) => {
      try {
        const payload = {
          carpool_id: selectedJoinCarpoolId,
          ...(participant.type === 'user'
            ? { add_self: true }
            : { child_id: participant.id }),
        };

        await addPassenger(payload, selectedJoinActivityId);

        if (selectedJoinCarpoolId) {
          await refreshCarpoolJoinedStatus(selectedJoinCarpoolId);
        }

        toast({
          title: 'Samåkning uppdaterad',
          description: `${participant.name} har lagts till i samåkningen!`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setIsModalOpen(false);
      } catch (error) {
        toast({
          title: 'Fel',
          description:
            error?.message ||
            'Ett fel inträffade vid försök att lägga till deltagare.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [
      addPassenger,
      refreshCarpoolJoinedStatus,
      selectedJoinActivityId,
      selectedJoinCarpoolId,
      toast,
    ]
  );

  return {
    participants,
    isModalOpen,
    loadingJoinState,
    openJoinModal,
    closeJoinModal,
    handleParticipantSelect,
  };
}