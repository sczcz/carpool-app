import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaArrowLeft, FaArrowsAltH } from 'react-icons/fa';
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
} from '@chakra-ui/react';
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { useUser } from '../utils/UserContext';
import CarpoolComponent from './CarPoolComponent';
import CarpoolChat from './CarpoolChat';
import CarpoolDetails from './CarpoolDetails';
import AddChildModal from './AddChildModal';


const DashBoardParent = ({ token }) => {
  const { userId, fullName, loading } = useUser();
  const [activities, setActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [openMyCarpoolIndex, setOpenMyCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [joinedChildrenInCarpool, setJoinedChildrenInCarpool] = useState({});
  const [childrenWithSameRole, setChildrenWithSameRole] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const [selectedCarpoolId, setSelectedCarpoolId] = useState(null);
  const [selectedCarpool, setSelectedCarpool] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const toast = useToast();
  const { isOpen: isAddChildOpen, onOpen: openAddChildModal, onClose: closeAddChildModal } = useDisclosure();

  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',     
    upptäckare: '#00a8e1', 
    äventyrare: '#e95f13', 
    utmanare: '#da005e',   
    rover: '#e2e000',        
  };

  const isInMyActivities = (activity) => {
    return activity.carpools.some((carpool) => {
      return (
        carpool.driver_id === userId ||
        carpool.passengers.some((passenger) =>
          passenger.parents.some((parent) => parent.parent_id === userId)
        )
      );
    });
  };

  const activitiesForUpcoming = activities.filter(activity => !isInMyActivities(activity));
  const activitiesForMyActivities = activities.filter(activity => isInMyActivities(activity));
  
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

  useEffect(() => {
    const filteredMyActivities = activities.filter((activity) =>
      activity.carpools.some((carpool) => {
        const isDriver = carpool.driver_id === userId;
        const hasChildAsPassenger = carpool.passengers.some((passenger) =>
          passenger.parents.some((parent) => parent.parent_id === userId)
        );
        return isDriver || hasChildAsPassenger;
      })
    );
  
    setMyActivities(filteredMyActivities);
  }, [activities, userId]);
  
  
  const fetchActivities = async () => {
    setActivityLoading(true);
    try {
      const response = await fetch('/api/protected/activity/by_role', { credentials: 'include' });
      const data = await response.json();
      const sortedActivities = data.events.sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));

      const activitiesWithCarpools = await Promise.all(sortedActivities.map(async (activity) => {
        const carpoolResponse = await fetch(`/api/carpool/list?activity_id=${activity.activity_id}`, { credentials: 'include' });
        const carpoolData = await carpoolResponse.json();
        return { ...activity, carpools: carpoolData.carpools || [] };
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
      return response.ok && data.all_joined;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const handleCarpoolClick = (activity, carpool) => {
    setSelectedActivity(activity);
    setSelectedCarpool(carpool);
    onDetailsOpen();
  };

  const handleChildAdded = () => {
    window.location.reload();
  };

  const fetchCarpoolsForActivity = async (activityId) => {
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
              return {
                ...activity,
                carpools: data.carpools.map((carpool) => ({
                  ...carpool,
                  passengers: carpool.passengers.map((passenger) => ({
                    ...passenger,
                    parents: passenger.parents.map((parent) => ({
                      parent_name: parent.parent_name,
                      parent_phone: parent.parent_phone,
                    })),
                    car: carpool.car
                  })),
                })),
              };
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
  };
  
  const handleJoinCarpool = async (carpoolId, activityId) => {
    try {
      const checkResponse = await fetch(`/api/carpool/check-multiple-children?carpool_id=${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const checkData = await checkResponse.json();
      setChildrenWithSameRole((prev) => ({
        ...prev,
        [carpoolId]: checkData.children,
      }));

      let selectedChildId = -1;

      if (checkData.multiple) {
        selectedChildId = prompt(
          `Select child ID:\n${checkData.children.map(child => `${child.child_id}: ${child.name}`).join('\n')}`
        );
        if (!selectedChildId) return;
      } else {
        selectedChildId = checkData.child_id;
      }

      const response = await fetch(`/api/carpool/add-passenger?carpool_id=${carpoolId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: selectedChildId }),
      });

      if (!response.ok) throw new Error('Failed to join carpool');

      toast({
        title: 'Joined Carpool',
        description: 'Successfully joined the carpool!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setJoinedChildrenInCarpool((prev) => ({
        ...prev,
        [carpoolId]: { allJoined: true },
      }));

      setActivities((prevActivities) =>
        prevActivities.map((activity) => {
          if (activity.activity_id === activityId) {
            return {
              ...activity,
              carpools: activity.carpools.map((carpool) =>
                carpool.id === carpoolId
                  ? {
                      ...carpool,
                      passengers: [
                        ...carpool.passengers,
                        { child_id: selectedChildId, parents: [{ parent_id: userId }] },
                      ],
                    }
                  : carpool
              ),
            };
          }
          return activity;
        })
      );
  
      setMyActivities((prevActivities) => [
        ...prevActivities,
        activities.find((activity) => activity.activity_id === activityId),
      ]);

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to join carpool',
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
  
    const activity = activities.find(a => a.activity_id === activityId);
    if (!activity.carpools || activity.carpools.length === 0) {
      fetchCarpoolsForActivity(activityId);
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
    onChatOpen();
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
            <Text fontSize="lg" color="brand.600">
              Hej {fullName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
            </Text>
          </Box>

          <Divider mb={6} />

          {myActivities.length > 0 && (
            <Box p={4}
            bg="blue.50"  // Sätt en ljusblå bakgrund
            borderRadius="lg" // Rundade hörn
            shadow="md" // Mjuk skugga
            borderWidth="0px" // Ta bort ramen
          >
              <Heading as="h2" size="md" mb={4} color="gray.600">Mina aktiviteter</Heading>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {activitiesForMyActivities.map((activity, index) => (
                  <Box key={activity.activity_id} borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="gray.50">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Tag size="lg" color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full">
                        <TagLabel>{activity.scout_level.charAt(0).toUpperCase() + activity.scout_level.slice(1)}</TagLabel>
                      </Tag>
                      <Button colorScheme="brand" size="sm" onClick={() => toggleMyCarpool(index)}>
                        {openMyCarpoolIndex === index ? 'Dölj Carpool' : 'Visa Carpool'}
                      </Button>
                    </Flex>
                    <Text fontWeight="bold">{format(parseISO(activity.dtstart), "d MMMM")}</Text>
                    <Text fontSize="sm" color="gray.600">Start: {format(parseISO(activity.dtstart), "HH:mm")}</Text>
                    <Text>{activity.location}</Text>
                    <Text mt={2}>{activity.summary.split('//')[0]}</Text>
                    <Collapse in={openMyCarpoolIndex === index} animateOpacity>
                    <Box mt={2} maxHeight="250px" overflowY="auto">
                      <VStack spacing={4}>
                        <Button
                          leftIcon={<FaPlus />}
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
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCarpool(carpool.id, activity.activity_id);
                                    }}
                                  >
                                    Ta bort
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
                                  Chat
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
            <Heading as="h2" size="md" mb={4} color="brand.500" mt={5}>
              Kommande aktiviteter
            </Heading>

            {/* Display a message if there are no activities */}
            {activities.length === 0 && (
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">Inga aktiviteter hittades. Lägg till barn</Text>
                <Button colorScheme="blue" onClick={openAddChildModal}>
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
                      {openCarpoolIndex === index ? 'Dölj Carpool' : 'Visa Carpool'}
                    </Button>
                  </Flex>
                  <Text fontWeight="bold">
                    {format(parseISO(activity.dtstart), "d MMMM")}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                   Start: {format(parseISO(activity.dtstart), "HH:mm")}
                  </Text>

                  <Text>{activity.location}</Text>
                  <Text mt={2}>{activity.summary.split('//')[0]}</Text>

                  <Collapse in={openCarpoolIndex === index} animateOpacity>
                    <Box mt={2} maxHeight="250px" overflowY="auto">
                      <VStack spacing={4}>
                        <Button
                          leftIcon={<FaPlus />}
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
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCarpool(carpool.id, activity.activity_id);
                                      }}
                                    >
                                      Ta bort
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
                                    Chat
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

          {/* Modal for Carpool Chat */}
          <Modal isOpen={isChatOpen} onClose={onChatClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Carpool Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* Rendera CarpoolChat och skicka in valt carpoolId */}
                <CarpoolChat carpoolId={selectedCarpoolId} userName={fullName} userId={userId}/>
              </ModalBody>
            </ModalContent>
          </Modal>
          {/* Carpool Details Modal */}
          {selectedActivity && selectedCarpool && (
            <CarpoolDetails
              isOpen={isDetailsOpen}
              onClose={onDetailsClose}
              activity={selectedActivity}
              carpool={selectedCarpool}
              currentUserId={userId}
              fetchCarpoolsForActivity={fetchCarpoolsForActivity}
            />
            )}
        </Box>
      </Flex>
    </Box>
  );
};

export default DashBoardParent;