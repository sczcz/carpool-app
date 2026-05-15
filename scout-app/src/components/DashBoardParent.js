import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Text,
  Divider,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useUser } from '../utils/UserContext';
import { useCarpool } from '../utils/CarpoolContext';
import roleColors from '../utils/roleColors';
import useActivities from '../hooks/useActivities';
import useCarpoolModal from '../hooks/useCarpoolModal';
import useJoinedChildren from '../hooks/useJoinedChildren';
import CarpoolComponent from './CarPoolComponent';
import SelectParticipantModal from './SelectParticipantModal';
import DashboardHeader from './DashboardHeader';
import FiltersBar from './FiltersBar';
import MyActivitiesPanel from './MyActivitiesPanel';
import UpcomingActivitiesPanel from './UpcomingActivitiesPanel';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const DashBoardParent = () => {
  const {
    selectedActivity,
    setSelectedActivity,
    setSelectedCarpool,
    onDetailsOpen,
    openChat,
    setSelectedCarpoolId,
  } = useCarpool();

  const { userId, fullName, loading: userLoading } = useUser();

  // Activities hook
  const {
    activities,
    fetchActivities,
    fetchCarpoolsForActivity,
    checkIfAllChildrenJoined,
    deleteCarpool,
    addPassenger,
    selectJoin,
    loading: activitiesLoading,
    error: activitiesError,
    fetchingCarpools 
  } = useActivities();

  const { joinedChildrenInCarpool, refreshCarpoolJoinedStatus } =
    useJoinedChildren(activities, checkIfAllChildrenJoined);

  const {
    participants,
    isModalOpen,
    loadingJoinState,
    openJoinModal,
    closeJoinModal,
    handleParticipantSelect,
  } = useCarpoolModal({
    selectJoin,
    addPassenger,
    refreshCarpoolJoinedStatus,
  });
  const [myActivities, setMyActivities] = useState([]);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [openMyCarpoolIndex, setOpenMyCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { isOpen: isAddChildOpen, onOpen: openAddChildModal, onClose: closeAddChildModal } = useDisclosure();
  const [filterByRole, setFilterByRole] = useState(true);

  const isInMyActivities = (activity) => {
    return activity.carpools?.some((carpool) => {
      const isDriver = carpool.driver_id === userId;
      const hasSelfAsPassenger = carpool.passengers?.some(
        (passenger) => passenger.user_id === userId
      );
      const hasChildAsPassenger = carpool.passengers?.some((passenger) =>
        passenger.parents?.some((parent) => parent.parent_id === userId)
      );
      return isDriver || hasSelfAsPassenger || hasChildAsPassenger;
    });
  };

  const activitiesForUpcoming = useMemo(
    () => activities.filter((activity) => !isInMyActivities(activity)),
    [activities, userId]
  );

  const activitiesForMyActivities = useMemo(
    () =>
      activities.filter(
        (activity) =>
          Array.isArray(activity.carpools) && isInMyActivities(activity)
      ),
    [activities, userId]
  );

  const toggleMyCarpool = useCallback((index) => {
    setOpenMyCarpoolIndex((prev) => (prev === index ? null : index));
  }, []);

  const openCarpoolModal = useCallback(
    (activityId) => {
      const activity = activities.find((a) => a.activity_id === activityId);
      setSelectedActivity(activity);
      setSelectedActivityId(activityId);
      onOpen();
    },
    [activities, onOpen]
  );

  const handleCarpoolClick = useCallback(
    (activity, carpool) => {
      setSelectedActivity(activity);
      setSelectedCarpool(carpool);
      setSelectedCarpoolId(carpool.id);
      onDetailsOpen();
    },
    [onDetailsOpen]
  );

  const handleDeleteCarpool = useCallback(
    async (carpoolId, activityId) => {
      try {
        const carpoolResponse = await fetch(`/api/carpool/${carpoolId}/passengers`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const carpoolData = await carpoolResponse.json();
        if (carpoolData.passengers && carpoolData.passengers.length > 0) {
          const confirmDelete = window.confirm(
            'Samåkningen har passagerare! Är du säker på att du vill ta bort?'
          );
          if (!confirmDelete) return;
        }

        await deleteCarpool(carpoolId, activityId);

        toast({
          title: 'Samåkning borttagen',
          description: 'Samåkning borttagen!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Kan inte ta bort samåkning',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [deleteCarpool]
  );

  const toggleCarpool = useCallback(
    (index, activityId) => {
      const isInMyActivities = myActivities.some((activity) => activity.activity_id === activityId);

      if (isInMyActivities) {
        const myActivityIndex = myActivities.findIndex((activity) => activity.activity_id === activityId);
        toggleMyCarpool(myActivityIndex);
      } else {
        setOpenCarpoolIndex((prev) => (prev === index ? null : index));
      }

      fetchCarpoolsForActivity(activityId).catch((e) => console.error(e));
    },
    [myActivities, fetchCarpoolsForActivity, toggleMyCarpool]
  );

  const openChatModal = useCallback(
    (carpoolId) => {
      setSelectedCarpoolId(carpoolId);
      openChat(carpoolId);
    },
    [openChat]
  );

  useEffect(() => {
    const updatedMyActivities = activities.filter((activity) =>
      activity.carpools?.some((carpool) => {
        const isDriver = carpool.driver_id === userId;
        const hasSelfAsPassenger = carpool.passengers?.some(
          (passenger) => passenger.user_id === userId
        );
        const hasChildAsPassenger = carpool.passengers?.some((passenger) =>
          passenger.parents?.some((parent) => parent.parent_id === userId)
        );
        return isDriver || hasSelfAsPassenger || hasChildAsPassenger;
      })
    );

    setMyActivities(updatedMyActivities);
  }, [activities, userId]);

  useEffect(() => {
    if (!userLoading && !userId) {
      window.location.href = '/';
    }
  }, [userLoading, userId]);

  useEffect(() => {
    if (userId && !userLoading) {
      fetchActivities(filterByRole).catch((e) => {
        console.error('fetchActivities failed', e);
      });
    }
  }, [userId, userLoading, filterByRole, fetchActivities]);

  const handleChildAdded = useCallback(() => {
    fetchActivities(filterByRole).catch((e) => {
      console.error('fetchActivities failed', e);
    });
  }, [fetchActivities, filterByRole]);

  const translateCarpoolType = (type) => {
    switch (type) {
      case 'drop-off':
        return 'Avresa';
      case 'pick-up':
        return 'Hemresa';
      case 'both':
        return 'Avresa & Hemresa';
      default:
        return 'Okänd';
    }
  };

  const handleLoadMore = () => {
    setVisibleActivitiesCount(visibleActivitiesCount + 10);
  };

  if (userLoading) return <LoadingState message="Laddar..." />;
  if (activitiesLoading) return <LoadingState message="Laddar aktiviteter..." />;
  if (activitiesError) return <ErrorState message={`Fel vid hämtning av aktiviteter: ${activitiesError}`} onRetry={() => { fetchActivities(filterByRole).catch(()=>{}); }} />;

  return (
    <Box p={5}>
      <Flex justify="center">
        <Box maxWidth="1200px" width="100%">
          {/* Header */}
          <DashboardHeader fullName={fullName} />

          {/* Welcome message */}
          <Box mb={6}>
            <Text fontSize={{ base: 'md', lg: 'lg' }} color="brand.600">
              Hej {fullName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
            </Text>
          </Box>

          <FiltersBar
            filterByRole={filterByRole}
            onToggleFilter={() => setFilterByRole(!filterByRole)}
            onAddChild={openAddChildModal}
          />
          <Divider mb={6} />

          {myActivities.length > 0 && (
            <MyActivitiesPanel
              activities={activitiesForMyActivities}
              openIndex={openMyCarpoolIndex}
              onToggle={toggleMyCarpool}
              onOpenCarpoolModal={openCarpoolModal}
              fetchingCarpools={fetchingCarpools}
              roleColors={roleColors}
              userId={userId}
              joinedChildrenInCarpool={joinedChildrenInCarpool}
              checkIfAllChildrenJoined={checkIfAllChildrenJoined}
              handleJoinCarpool={openJoinModal}
              loadingJoinState={loadingJoinState}
              handleDeleteCarpool={handleDeleteCarpool}
              openChatModal={openChatModal}
              translateCarpoolType={translateCarpoolType}
              onCarpoolClick={handleCarpoolClick}
            />
          )}

          {/* Upcoming activities */}
          <UpcomingActivitiesPanel
            activities={activities}
            activitiesForUpcoming={activitiesForUpcoming}
            visibleActivitiesCount={visibleActivitiesCount}
            openCarpoolIndex={openCarpoolIndex}
            toggleCarpool={toggleCarpool}
            roleColors={roleColors}
            openCarpoolModal={openCarpoolModal}
            fetchingCarpools={fetchingCarpools}
            userId={userId}
            joinedChildrenInCarpool={joinedChildrenInCarpool}
            checkIfAllChildrenJoined={checkIfAllChildrenJoined}
            onJoinCarpool={openJoinModal}
            loadingJoinState={loadingJoinState}
            onDeleteCarpool={handleDeleteCarpool}
            openChatModal={openChatModal}
            onCarpoolClick={handleCarpoolClick}
            translateCarpoolType={translateCarpoolType}
            handleLoadMore={handleLoadMore}
            isAddChildOpen={isAddChildOpen}
            openAddChildModal={openAddChildModal}
            closeAddChildModal={closeAddChildModal}
            handleChildAdded={handleChildAdded}
          />

          {/* Modal for Carpool Registration */}
          <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'xs', md: 'md', lg: 'lg' }} isCentered>
            <ModalOverlay />
            <ModalContent maxW={{ base: '95%', md: '500px' }} mx="auto">
              <ModalHeader fontSize={{ base: 'lg', md: 'xl' }} textAlign="center">
                Registrera Carpool
              </ModalHeader>
              <ModalCloseButton size={{ base: 'sm', md: 'md' }} />
              <ModalBody p={{ base: 2, md: 4 }} maxH={{ base: '60vh', md: 'none' }} overflowY={{ base: 'auto', md: 'visible' }}>
                {selectedActivity && (
                  <CarpoolComponent
                    activityId={selectedActivityId}
                    onClose={onClose}
                    activity={selectedActivity}
                    onCarpoolCreated={() => fetchCarpoolsForActivity(selectedActivityId, { force: true })}
                  />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          <SelectParticipantModal
            isOpen={isModalOpen}
            onClose={closeJoinModal}
            participants={participants}
            onSelect={handleParticipantSelect}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default DashBoardParent;