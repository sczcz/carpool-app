import React, { useEffect, useState } from 'react';
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
import CarpoolComponent from './CarPoolComponent';
import CarpoolChat from './CarpoolChat';
import { checkIfLoggedIn } from '../utils/auth';
import CarpoolDetails from './CarpoolDetails';
import AddChildModal from './AddChildModal'; // Import the AddChildModal component


const DashBoardParent = ({ token }) => {
  const [authLoading, setAuthLoading] = useState(true); // New state for auth check
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
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
  const navigate = useNavigate();  // Added navigate for routing
  const { isOpen: isAddChildOpen, onOpen: openAddChildModal, onClose: closeAddChildModal } = useDisclosure();

  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',     
    upptäckare: '#00a8e1', 
    äventyrare: '#e95f13', 
    utmanare: '#da005e',   
    rover: '#e2e000',        
  };



  useEffect(() => {
    const verifyUser = async () => {
      const loggedIn = await checkIfLoggedIn();
      if (loggedIn) {
        setAuthLoading(false); // Only stop loading if user is logged in
      }
      // No need to do anything if the user is not logged in, since checkIfLoggedIn will redirect
    };

    verifyUser();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchUserData();
    }
  }, [authLoading]);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
  
        setUserName(user.first_name + " " + user.last_name);
        setUserId(user.id);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  useEffect(() => {
      fetchActivities();
  }, [token]);
  
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/protected/activity/by_role', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Något gick fel vid hämtning av aktiviteter');
      }
  
      const data = await response.json();
      const sortedActivities = data.events.sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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

      await fetchCarpoolsForActivity(activityId);

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

      await fetchCarpoolsForActivity(activityId);
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
    setSelectedActivityId(activityId);
    onOpen();
  };

  const toggleCarpool = (index, activityId) => {
    if (openCarpoolIndex === index) {
      setOpenCarpoolIndex(null);
    } else {
      setOpenCarpoolIndex(index);
      fetchCarpoolsForActivity(activityId);
    }
  };

const translateCarpoolType = (type) => {
  switch (type) {
    case 'drop-off':
      return 'Avlämning';
    case 'pick-up':
      return 'Hämtning';
    case 'both':
      return 'Båda';
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

  if (authLoading) {
    // Show only the auth loading spinner until the check is complete
    return (
      <VStack>
        <Spinner size="xl" color="brand.500" />
        <Text>Kontrollerar åtkomst...</Text>
      </VStack>
    );
  }

  if (loading) {
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
              <Heading as="h1" size="lg" color="brand.500">Välkommen, {userName}</Heading>
            </HStack>
          </Flex>

          {/* Welcome message */}
          <Box mb={6}>
            <Text fontSize="lg" color="brand.600">
              Hej {userName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
            </Text>
          </Box>

          <Divider mb={6} />

          {/* Upcoming activities */}
          <Box mb={8}>
            <Heading as="h2" size="md" mb={4} color="brand.500">
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
              {activities.slice(0, visibleActivitiesCount).map((activity, index) => (
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
                          Lägg till Carpool
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
                              <Flex justify="space-between" align="center" wrap="wrap">
                              <Box>
                                <Text fontSize="md" color="brand.600">
                                  {carpool.departure_address} - {carpool.departure_city} ({translateCarpoolType(carpool?.carpool_type) || 'N/A'})
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Tillgängliga Platser: {carpool.available_seats}
                                </Text>
                              </Box>
                              <Flex gap="2" mt={{ base: 2, md: 0 }}>
                                {/* Show Delete button if the current user is the creator of the carpool */}
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

                                {/* Boka-knappen */}
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

                                {/* Chat-knappen */}
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
                <CarpoolComponent 
                  activityId={selectedActivityId} onClose={onClose} 
                  onCarpoolCreated={() => fetchCarpoolsForActivity(selectedActivityId)}
                />
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
                <CarpoolChat carpoolId={selectedCarpoolId} userName={userName} userId={userId}/>
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