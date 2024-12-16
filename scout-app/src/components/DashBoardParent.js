import React, { useEffect, useState } from 'react';
import { InfoIcon } from '@chakra-ui/icons';
import { FaTrash, FaCarSide} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale'
import { useUser } from '../utils/UserContext';
import { useCarpool } from '../utils/CarpoolContext';
import CarpoolComponent from './CarPoolComponent';
import AddChildModal from './AddChildModal';
import SelectParticipantModal from './SelectParticipantModal'

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

  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',     
    upptäckare: '#00a8e1', 
    äventyrare: '#e95f13', 
    utmanare: '#da005e',   
    rover: '#e2e000',  
    vuxenscout: '#40e0d0',
    ledare: '#7fffd4'

  };

  const isInMyActivities = (activity) => {
    return activity.carpools?.some((carpool) => {
      const isDriver = carpool.driver_id === userId;
      const hasSelfAsPassenger = carpool.passengers?.some(
        (passenger) => passenger.user_id === userId // Kontrollera user_id för vuxna
      );
      const hasChildAsPassenger = carpool.passengers?.some((passenger) =>
        passenger.parents?.some((parent) => parent.parent_id === userId) // Kontrollera föräldrar
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
        ? '/api/protected/activity/by_role' // Rollbaserade aktiviteter
        : '/api/protected/activity/no_role'; // Alla synliga aktiviteter
  
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
      setParticipants(participantsData); // Uppdatera modalens data
      setSelectedCarpoolId(carpoolId);  // Spara carpool ID:n
      setSelectedActivityId(activityId); // Spara aktivitet ID:n
      setIsModalOpen(true); // Öppna modalen
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
  
      setIsModalOpen(false); // Stäng modalen
      fetchCarpoolsForActivity(selectedActivityId); // Uppdatera carpools
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

  if (loading) {
    return (
      <VStack>
        <Spinner size="xl" color="brand.500" />
        <Text>Laddar...</Text>
      </VStack>
    );
  }

  if (activityLoading) {
    return (
      <VStack>
        <Spinner size="xl" color="brand.500" />
        <Text>Laddar aktiviteter...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack>
        <Text color="red.500">Fel vid hämtning av aktiviteter: {error}</Text>
        <Button onClick={() => { setError(null); fetchActivities(); }} colorScheme="blue">Försök igen</Button>
      </VStack>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="center">
        <Box maxWidth="1200px" width="100%">
          {/* Header */}
          <Flex justify="space-between" align="center" mb={5}>
            <HStack>
              <Icon as={FaUserCircle} w={8} h={8} color="brand.500" />
              <Heading as="h1" size="lg" color="brand.500">Välkommen, {fullName}</Heading>
            </HStack>
          </Flex>

          {/* Welcome message */}
          <Box mb={6}>
          <Text fontSize={{ base: 'md', lg: 'lg' }} color="brand.600">
            Hej {fullName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
          </Text>
          </Box>


          <Box mb={4}>
            <Button
              fontSize={{ base: 'sm', lg: 'md' }}
              colorScheme={filterByRole ? 'gray' : 'gray'}
              onClick={() => setFilterByRole(!filterByRole)} // Endast uppdatera state här
            >
              {filterByRole ? 'Visa alla aktiviteter' : 'Visa endast aktiviteter baserat på dina barns roller'}
            </Button>
          </Box>



          <Divider mb={6} />

          {myActivities.length > 0 && (
            <Box p={4}
            bg="blue.50"  // Sätt en ljusblå bakgrund
            borderRadius="lg" // Rundade hörn
            shadow="md" // Mjuk skugga
            borderWidth="0px" // Ta bort ramen
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
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {activitiesForMyActivities.map((activity, index) => (
                  <Box key={activity.activity_id} borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="gray.50">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Tag size="lg" color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full">
                        <TagLabel>{activity.scout_level.charAt(0).toUpperCase() + activity.scout_level.slice(1)}</TagLabel>
                      </Tag>
                      <Button colorScheme="brand" size="sm" onClick={() => toggleMyCarpool(index)}>
                        {openMyCarpoolIndex === index ? 'Dölj samåkning' : 'Visa samåkning'}
                      </Button>
                    </Flex>
                    <Text fontWeight="bold">{format(parseISO(activity.dtstart), "d MMMM", { locale: sv })}</Text>
                    <Text fontSize="sm" color="gray.600">Start: {format(parseISO(activity.dtstart), "HH:mm")}</Text>
                    <Text>{activity.location}</Text>
                    <Text mt={2}>{activity.summary.split('//')[0]}</Text>
                    <Collapse in={openMyCarpoolIndex === index} animateOpacity>
                    <Box mt={2} maxHeight="250px" overflowY="auto">
                      <VStack spacing={4}>
                        <Button
                          rightIcon={<FaPlus />}
                          leftIcon={<FaCarSide/>}
                          colorScheme="brand"
                          size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCarpoolModal(activity.activity_id);
                        }}
                      >
                          Lägg till Samåkning
                        </Button>

                        {fetchingCarpools ? (
                      <Spinner />
                    ) : Array.isArray(activity.carpools) && activity.carpools.length > 0 ? (
                      activity.carpools.map((carpool) => (
                        <Box
                          key={carpool.id}
                          p={4}
                          borderWidth={1}
                          borderRadius="lg"
                          w="100%"
                          bg="gray.50"
                          boxShadow="sm"
                          fontSize={{ base: 'sm', sm: 'md' }}
                          onClick={(e) => { e.stopPropagation(); handleCarpoolClick(activity, carpool) }}
                          cursor="pointer"
                          _hover={{ bg: 'gray.100' }}
                        >
                          <Flex direction="column">
                              {/* Text Section */}
                              <Flex justify="space-between" mb={2}>
                                <Text fontSize="md" color="brand.600" flex="1" noOfLines={1}>
                                  {carpool.departure_address}
                                  {carpool.carpool_type === 'drop-off' && (
                                    <span style={{ margin: '0 8px', color: 'gray.600' }}>→</span>
                                  )}
                                  {carpool.carpool_type === 'pick-up' && (
                                    <span style={{ margin: '0 8px', color: 'gray.600' }}>←</span>
                                  )}
                                  {carpool.carpool_type === 'both' && (
                                    <span style={{ margin: '0 8px', color: 'gray.600' }}>↔</span>
                                  )}
                                  {activity.location} ({translateCarpoolType(carpool?.carpool_type) || 'N/A'})
                                </Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500" mb={2}>
                                Tillgängliga Platser: {carpool.available_seats}
                              </Text>

                              {/* Buttons Section */}
                              <Flex justify="flex-end" gap="2" mt="auto">
                                {carpool.driver_id === userId && (
                                  <Button
                                  colorScheme="red"
                                  variant="outline" // Use outline variant if you want a border
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCarpool(carpool.id, activity.activity_id);
                                    }}
                                  >
                                  <Icon as={FaTrash} color="red.500" /> {/* Red color for the icon */}
                                  </Button>
                                )}

                                {carpool.available_seats > 0 ? (
                                  <Button
                                    colorScheme={joinedChildrenInCarpool[carpool.id]?.allJoined ? 'blue' : 'green'}
                                    size="sm"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const allChildrenJoined = await checkIfAllChildrenJoined(carpool.id);
                                      if (allChildrenJoined) {
                                        setJoinedChildrenInCarpool((prev) => ({
                                          ...prev,
                                          [carpool.id]: { allJoined: true },
                                        }));
                                        return;
                                      }
                                      handleJoinCarpool(carpool.id, activity.activity_id);
                                    }}
                                    isDisabled={joinedChildrenInCarpool[carpool.id]?.allJoined} // Disable if "Joined"
                                  >
                                    {loadingJoinState[carpool.id] ? (
                                      <Spinner size="xs" />
                                    ) : joinedChildrenInCarpool[carpool.id]?.allJoined ? (
                                      'Bokad'
                                    ) : (
                                      'Boka'
                                    )}
                                  </Button>
                                ) : (
                                  <Button colorScheme="red" size="sm" isDisabled>
                                    Full
                                  </Button>
                                )}

                                <Button
                                  colorScheme="teal"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openChatModal(carpool.id);
                                  }}
                                >
                                  Chatt
                                </Button>
                                <Button
                                    display={{ base: 'inline-flex', md: 'none' }} // Visible only on smaller screens
                                    colorScheme="cyan"
                                    color="white"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCarpoolClick(activity, carpool); // Open carpool details modal
                                    }}
                                  >
                                    Info
                                  </Button>
                              </Flex>
                            </Flex>
                            </Box>
                          ))
                        ) : (
                          <Text>Inga tillgängliga samåkningar för denna aktivitet.</Text>
                        )}
                      </VStack>
                    </Box>
                  </Collapse>
                  </Box>
                ))}
              </SimpleGrid>
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

            {/* Display a message if there are no activities */}
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
            {/* AddChildModal component */}
            <AddChildModal
              isOpen={isAddChildOpen}
              onClose={closeAddChildModal}
              onChildAdded={handleChildAdded}
            />

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {activitiesForUpcoming.slice(0, visibleActivitiesCount).map((activity, index) => (
                <Box key={activity.activity_id} borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="white">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Tag size="lg" color={'white'} backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full">
                    <TagLabel>{activity.scout_level.charAt(0).toUpperCase() + activity.scout_level.slice(1)}</TagLabel>
                    </Tag>
                    <Button
                      colorScheme="brand"
                      size="sm"
                      onClick={() => toggleCarpool(index, activity.activity_id)}
                    >
                      {openCarpoolIndex === index ? 'Dölj samåkning' : 'Visa samåkning'}
                    </Button>
                  </Flex>
                  <Text fontWeight="bold">
                    {format(parseISO(activity.dtstart), "d MMMM", { locale: sv })}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Start: {format(parseISO(activity.dtstart), "HH:mm", { locale: sv })}
                  </Text>

                  <Text>{activity.location}</Text>
                  <Text mt={2}>{activity.summary.split('//')[0]}</Text>

                  <Collapse in={openCarpoolIndex === index} animateOpacity>
                    <Box mt={2} maxHeight="250px" overflowY="auto">
                      <VStack spacing={4}>
                        <Button
                         rightIcon={<FaPlus />}
                         leftIcon={<FaCarSide/>}
                          colorScheme="brand"
                          size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCarpoolModal(activity.activity_id);
                        }}
                      >
                          Lägg till Samåkning
                        </Button>

                        {fetchingCarpools ? (
                          <Spinner />
                        ) : Array.isArray(activity.carpools) && activity.carpools.length > 0 ? (
                          activity.carpools.map((carpool) => (
                            <Box
                              key={carpool.id}
                              p={4}
                              borderWidth={1}
                              borderRadius="lg"
                              w="100%"
                              bg="gray.50"
                              boxShadow="sm"
                              fontSize={{ base: 'sm', sm: 'md' }}
                              onClick={(e) => { e.stopPropagation(); handleCarpoolClick(activity, carpool)}}
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              
                            >
                              <Flex direction="column">
                                {/* Text Section */}
                                <Flex justify="space-between" mb={2}>
                                  <Text fontSize="md" color="brand.600" flex="1" noOfLines={1}>
                                    {carpool.departure_address}
                                    {carpool.carpool_type === 'drop-off' && (
                                      <span style={{ margin: '0 8px', color: 'gray.600' }}>→</span>
                                    )}
                                    {carpool.carpool_type === 'pick-up' && (
                                      <span style={{ margin: '0 8px', color: 'gray.600' }}>←</span>
                                    )}
                                    {carpool.carpool_type === 'both' && (
                                      <span style={{ margin: '0 8px', color: 'gray.600' }}>↔</span>
                                    )}
                                    {activity.location} ({translateCarpoolType(carpool?.carpool_type) || 'N/A'})
                                  </Text>
                                </Flex>
                                <Text fontSize="sm" color="gray.500" mb={2}>
                                  Tillgängliga Platser: {carpool.available_seats}
                                </Text>

                                {/* Buttons Section */}
                                <Flex justify="flex-end" gap="2" mt="auto">
                                  {carpool.driver_id === userId && (
                                    <Button
                                    colorScheme="red"
                                    variant="outline" // Use outline variant if you want a border
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCarpool(carpool.id, activity.activity_id);
                                      }}
                                    >
                                      <Icon as={FaTrash} color="red.500" /> {/* Red color for the icon */}
                                    </Button>
                                  )}

                                  {carpool.available_seats > 0 ? (
                                    <Button
                                      colorScheme={joinedChildrenInCarpool[carpool.id]?.allJoined ? 'blue' : 'green'}
                                      size="sm"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const allChildrenJoined = await checkIfAllChildrenJoined(carpool.id);
                                        if (allChildrenJoined) {
                                          setJoinedChildrenInCarpool((prev) => ({
                                            ...prev,
                                            [carpool.id]: { allJoined: true },
                                          }));
                                          return;
                                        }
                                        handleJoinCarpool(carpool.id, activity.activity_id);
                                      }}
                                      isDisabled={joinedChildrenInCarpool[carpool.id]?.allJoined} // Disable if "Joined"
                                    >
                                      {loadingJoinState[carpool.id] ? (
                                        <Spinner size="xs" />
                                      ) : joinedChildrenInCarpool[carpool.id]?.allJoined ? (
                                        'Bokad'
                                      ) : (
                                        'Boka'
                                      )}
                                    </Button>
                                  ) : (
                                    <Button colorScheme="red" size="sm" isDisabled>
                                      Full
                                    </Button>
                                  )}

                                  <Button
                                    colorScheme="teal"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openChatModal(carpool.id);
                                    }}
                                  >
                                    Chatt
                                  </Button>
                                  <Button
                                    display={{ base: 'inline-flex', md: 'none' }} // Visible only on smaller screens
                                    colorScheme="cyan"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCarpoolClick(activity, carpool); // Open carpool details modal
                                    }}
                                  >
                                    Info
                                  </Button>
                                </Flex>
                              </Flex>
                            </Box>
                          ))
                        ) : (
                          <Text>Inga tillgängliga samåkningar för denna aktivitet.</Text>
                        )}
                      </VStack>
                    </Box>
                  </Collapse>
                </Box>
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

          {/* Select Participant Modal */}
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