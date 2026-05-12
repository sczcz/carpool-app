import React, { useEffect, useState } from 'react';
import { InfoIcon } from '@chakra-ui/icons';
import { FaPlus } from 'react-icons/fa';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Divider,
  Flex,
  Collapse,
  Tag,
  TagLabel,
  Spinner,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton, 
  Popover, 
  PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale'
import { useUser } from '../utils/UserContext';
import { useCarpool } from '../utils/CarpoolContext';
import roleColors from '../utils/roleColors';
import CarpoolComponent from './CarPoolComponent';
import AddChildModal from './AddChildModal';
import SelectParticipantModal from './SelectParticipantModal'
import DashboardHeader from './DashboardHeader';
import FiltersBar from './FiltersBar';
import ActivityList from './ActivityList';
import ActivityCard from './ActivityCard';
import CarpoolList from './CarpoolList';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const DashBoardParent = ({ token }) => {
  const {
    activities,
    setActivities,
    fetchCarpoolsForActivity,
    selectedActivity,
    setSelectedActivity,
    selectedCarpool,
    setSelectedCarpool,
    isDetailsOpen,
    onDetailsOpen,
    onDetailsClose,
    openChat,
    selectedCarpoolId,
    setSelectedCarpoolId,
    isChatOpen,
  } = useCarpool();
  const { userId, fullName, loading } = useUser();
  const [myActivities, setMyActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [openMyCarpoolIndex, setOpenMyCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [fetchedCarpools, setFetchedCarpools] = useState(new Set());
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [joinedChildrenInCarpool, setJoinedChildrenInCarpool] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { isOpen: isAddChildOpen, onOpen: openAddChildModal, onClose: closeAddChildModal } = useDisclosure();
  const [filterByRole, setFilterByRole] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);

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
  

  const activitiesForUpcoming = activities.filter(activity => !isInMyActivities(activity));
  const activitiesForMyActivities = activities.filter((activity) => 
    Array.isArray(activity.carpools) && isInMyActivities(activity)
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
    if (!loading && !userId) {
      window.location.href = '/';
    }
  }, [loading, userId]);

  useEffect(() => {
    if (userId && !loading) {
      fetchActivities();
    }
  }, [userId, loading]);

  useEffect(() => {
    setMyActivities(activities.filter(activity => isInMyActivities(activity)));
  }, [activities]);
  
  const fetchActivities = async () => {
    setActivityLoading(true);
    try {
      const apiEndpoint = filterByRole
        ? '/api/protected/activity/by_role'
        : '/api/protected/activity/no_role';
  
      const response = await fetch(apiEndpoint, { credentials: 'include' });
      const data = await response.json();
  
      const sortedActivities = data.events.sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
  
      const activitiesWithCarpools = await Promise.all(
        sortedActivities.map(async (activity) => {
          try {
            const carpoolResponse = await fetch(`/api/carpool/list?activity_id=${activity.activity_id}`, {
              credentials: 'include',
            });
            const carpoolData = await carpoolResponse.json();
            return { ...activity, carpools: carpoolData.carpools || [] };
          } catch (error) {
            console.error(`Error fetching carpools for activity ${activity.activity_id}:`, error);
            return { ...activity, carpools: [] };
          }
        })
      );
  
      setActivities(activitiesWithCarpools);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setActivityLoading(false);
    }
  };
  
  useEffect(() => {
    fetchActivities();
  }, [filterByRole]);
  
  

  const toggleUpcomingCarpool = (index) => {
    setOpenCarpoolIndex(openCarpoolIndex === index ? null : index);
  };

  const toggleMyCarpool = (index) => {
    setOpenMyCarpoolIndex(openMyCarpoolIndex === index ? null : index);
  };
  
  const [loadingJoinState, setLoadingJoinState] = useState({});
  
  useEffect(() => {
    if (activities.length > 0) {
      initializeJoinedChildrenState();
    }
  }, [activities]);
  
  const initializeJoinedChildrenState = async () => {
    const joinedStatus = {};
    for (const activity of activities) {
      if (activity.carpools) {
        for (const carpool of activity.carpools) {
          const allChildrenJoined = await checkIfAllChildrenJoined(carpool.id);
          joinedStatus[carpool.id] = { allJoined: allChildrenJoined };
        }
      }
    }
    setJoinedChildrenInCarpool(joinedStatus);
  };

  const checkIfAllChildrenJoined = async (carpoolId) => {
    try {
      const response = await fetch(`/api/carpool/all-children-joined?carpool_id=${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      return response.ok && data.all_children_joined && data.user_already_joined;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const handleCarpoolClick = (activity, carpool) => {
    setSelectedActivity(activity);
    setSelectedCarpool(carpool);
    setSelectedCarpoolId(carpool.id);
    onDetailsOpen();
  };

  const handleChildAdded = () => {
    window.location.reload();
  };

  const handleJoinCarpool = async (carpoolId, activityId) => {
    try {
      const response = await fetch(`/api/carpool/select-join?carpool_id=${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Misslyckades med att hämta deltagare.');
      }
  
      const participantsData = await response.json();
      setParticipants(participantsData);
      setSelectedCarpoolId(carpoolId);
      setSelectedActivityId(activityId);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: 'Fel',
        description: error.message || 'Ett fel inträffade vid hämtning av deltagare.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  const handleParticipantSelect = async (participant) => {
    try {
      const response = await fetch(`/api/carpool/add-passenger`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carpool_id: selectedCarpoolId,
          ...(participant.type === 'user'
            ? { add_self: true }
            : { child_id: participant.id }),
        }),
      });
  
      if (!response.ok) throw new Error('Misslyckades med att lägga till deltagare.');
  
      toast({
        title: 'Samåkning uppdaterad',
        description: `${participant.name} har lagts till i samåkningen!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      setIsModalOpen(false);
      fetchCarpoolsForActivity(selectedActivityId);
    } catch (error) {
      toast({
        title: 'Fel',
        description: error.message || 'Ett fel inträffade vid försök att lägga till deltagare.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  

  const handleDeleteCarpool = async (carpoolId, activityId) => {
    try {
      const carpoolResponse = await fetch(`/api/carpool/${carpoolId}/passengers`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const carpoolData = await carpoolResponse.json();
  
      if (carpoolData.passengers && carpoolData.passengers.length > 0) {
        const confirmDelete = window.confirm(
          "Samåkningen har passagerare! Är du säker på att du vill ta bort?"
        );
        if (!confirmDelete) return;
      }
  
      const response = await fetch(`/api/carpool/${carpoolId}/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) throw new Error('Failed to delete carpool');
  
      toast({
        title: 'Samåkning borttagen',
        description: 'Samåkning borttagen!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      setMyActivities((prevActivities) =>
        prevActivities
          .map((activity) =>
            activity.activity_id === activityId
              ? {
                  ...activity,
                  carpools: activity.carpools.filter((carpool) => carpool.id !== carpoolId),
                }
              : activity
          )
          .filter((activity) => activity.carpools.length > 0)
      );
  
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.activity_id === activityId
            ? {
                ...activity,
                carpools: activity.carpools.filter((carpool) => carpool.id !== carpoolId),
              }
            : activity
        )
      );
  
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Kan inte ta bort samåkning',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openCarpoolModal = (activityId) => {
    const activity = activities.find(a => a.activity_id === activityId);
    setSelectedActivity(activity);
    setSelectedActivityId(activityId);
    onOpen();
  };
  
  const toggleCarpool = (index, activityId) => {
    const isInMyActivities = myActivities.some(activity => activity.activity_id === activityId);
  
    if (isInMyActivities) {
      const myActivityIndex = myActivities.findIndex(activity => activity.activity_id === activityId);
      toggleMyCarpool(myActivityIndex);
    } else {
      setOpenCarpoolIndex(openCarpoolIndex === index ? null : index);
    }
  
    if (!fetchedCarpools.has(activityId)) {
      fetchCarpoolsForActivity(activityId);
      setFetchedCarpools((prevSet) => new Set(prevSet).add(activityId));
    }
  }; 

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

  const openChatModal = (carpoolId) => {
    setSelectedCarpoolId(carpoolId);
    openChat(carpoolId);
  };

  if (loading) return <LoadingState message="Laddar..." />;
  if (activityLoading) return <LoadingState message="Laddar aktiviteter..." />;
  if (error) return <ErrorState message={`Fel vid hämtning av aktiviteter: ${error}`} onRetry={() => { setError(null); fetchActivities(); }} />;

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
            <Box p={4}
            bg="blue.50"
            borderRadius="lg"
            shadow="md"
            borderWidth="0px"
          >
              <Box mb={8} display="flex" alignItems="center">
              <Heading as="h2" size="md" mb={4} color="gray.700" mt={5} fontWeight="bold">
              Mina aktiviteter              
              </Heading>
              <Popover>
                <PopoverTrigger>
                  <IconButton 
                    icon={<InfoIcon />} 
                    aria-label="More Info" 
                    variant="unstyled" 
                    fontSize={{ base: 'l' }} 
                    _hover={{ color: "gray.700" }}
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <Text mb={2}>
                    Här kan du se dina bokade samåkningar samt de samåkningar som du har skapat. 
                    </Text>
                    <Text>
                    "Mina aktiviteter" visar både resor du ska delta i och de samåkningar där du erbjuder plats för andra.
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>
              <ActivityList
                activities={activitiesForMyActivities}
                openIndex={openMyCarpoolIndex}
                onToggle={(index) => toggleMyCarpool(index)}
                onOpenCarpoolModal={openCarpoolModal}
                fetchingCarpools={fetchingCarpools}
                roleColors={roleColors}
                userId={userId}
                joinedChildrenInCarpool={joinedChildrenInCarpool}
                checkIfAllChildrenJoined={checkIfAllChildrenJoined}
                handleJoinCarpool={handleJoinCarpool}
                loadingJoinState={loadingJoinState}
                handleDeleteCarpool={handleDeleteCarpool}
                openChatModal={openChatModal}
                translateCarpoolType={translateCarpoolType}
                onCarpoolClick={handleCarpoolClick}
              />
            </Box>
          )}

          {/* Upcoming activities */}
          <Box mb={8}>
            <Box mb={8} display="flex" alignItems="center">
              <Heading as="h2" size="md" mb={4} color="gray.700" mt={5} fontWeight="bold">
                Kommande aktiviteter
              </Heading>
              <Popover>
                <PopoverTrigger>
                <IconButton 
                    icon={<InfoIcon />} 
                    aria-label="More Info" 
                    variant="unstyled" 
                    fontSize={{ base: 'l' }} 
                    _hover={{ color: "gray.700" }}
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    Här kan du se detaljerad information om kommande aktiviteter och hur du kan boka.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>

            {activities.length === 0 && (
              <VStack spacing={4}>
                <Box mb={8} display="flex" alignItems="center">
                <Text fontSize="lg" color="gray.500">Inga aktiviteter hittades. Lägg till barn</Text>
                  <Popover>
                    <PopoverTrigger>
                    <IconButton 
                    icon={<InfoIcon />} 
                    aria-label="More Info" 
                    variant="unstyled" 
                    fontSize={{ base: 'l' }} 
                    _hover={{ color: "gray.700" }}
                  />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverBody>
                      För att se dina barns aktiviteter måste du först lägga till dem. För att boka in dig själv, klicka på 'Visa alla aktiviteter'.                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Box>
                <Button size="sm" rightIcon={<FaPlus />} colorScheme="brand" onClick={openAddChildModal}>
                  Lägg till barn
                </Button>
              </VStack>
            )}
            <AddChildModal
              isOpen={isAddChildOpen}
              onClose={closeAddChildModal}
              onChildAdded={handleChildAdded}
            />

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {activitiesForUpcoming.slice(0, visibleActivitiesCount).map((activity, index) => (
                <ActivityCard
                  key={activity.activity_id}
                  activity={activity}
                  index={index}
                  isOpen={openCarpoolIndex === index}
                  onToggle={toggleCarpool}
                  roleColors={roleColors}
                >
                  <CarpoolList
                    activity={activity}
                    carpools={activity.carpools}
                    fetchingCarpools={fetchingCarpools}
                    onOpenCarpoolModal={openCarpoolModal}
                    userId={userId}
                    joinedChildrenInCarpool={joinedChildrenInCarpool}
                    checkIfAllChildrenJoined={checkIfAllChildrenJoined}
                    onJoinCarpool={handleJoinCarpool}
                    loadingJoinState={loadingJoinState}
                    onDeleteCarpool={handleDeleteCarpool}
                    onOpenChat={openChatModal}
                    onCarpoolClick={handleCarpoolClick}
                    translateCarpoolType={translateCarpoolType}
                  />
                </ActivityCard>
              ))}
            </SimpleGrid>

            <Button mt={4} onClick={handleLoadMore} colorScheme="teal">
              Ladda fler ↓
            </Button>
          </Box>

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
                onCarpoolCreated={() => fetchCarpoolsForActivity(selectedActivityId)}
              />
            )}
              </ModalBody>
            </ModalContent>
          </Modal>

          <SelectParticipantModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              participants={participants}
              onSelect={handleParticipantSelect}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default DashBoardParent;