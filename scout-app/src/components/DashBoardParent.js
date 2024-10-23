import React, { useEffect, useState } from 'react';
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
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaUserCircle, FaCar, FaPlus } from 'react-icons/fa'; // Import FaPlus icon
import { format, parseISO } from 'date-fns'; // Import date-fns for date formatting
import CarpoolComponent from './CarPoolComponent';

const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const [fetchingCarpools, setFetchingCarpools] = useState(false); // For fetching carpools
  const [selectedActivityId, setSelectedActivityId] = useState(null); // Store selected activity for modal
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal controls
  const toast = useToast();

  // Fetch activities from the API
  const fetchActivities = async () => {
    setLoading(true); // Set loading state before fetching
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
      const sortedActivities = data.events.sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch carpools for a specific activity
  const fetchCarpoolsForActivity = async (activityId) => {
    setFetchingCarpools(true); // Start fetching state
    try {
      const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update carpools for the specific activity
        setActivities((prevActivities) =>
          prevActivities.map((activity) => {
            if (activity.activity_id === activityId) {
              return { ...activity, carpools: data.carpools }; // Add carpools
            }
            return activity;
          })
        );
      } else {
        throw new Error('Failed to fetch carpools');
      }
    } catch (error) {
      console.error('Error fetching carpools:', error);
      toast({
        title: 'Error fetching carpools.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingCarpools(false); // End fetching state
    }
  };

  // Fetch user data
  useEffect(() => {
    const name = 'Användare';
    setUserName(name);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [token]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/protected/user', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          setUserName(`${user.first_name} ${user.last_name}`);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Toggle carpool visibility and fetch carpools if needed
  const toggleCarpool = (index, activityId) => {
    if (openCarpoolIndex === index) {
      setOpenCarpoolIndex(null); // Close if the same is clicked again
    } else {
      setOpenCarpoolIndex(index);
      fetchCarpoolsForActivity(activityId); // Fetch carpools for the selected activity
    }
  };

  // Handle opening the modal to register a carpool
  const openCarpoolModal = (activityId) => {
    setSelectedActivityId(activityId);
    onOpen(); // Open the modal
  };

  const handleLoadMore = () => {
    setVisibleActivitiesCount(visibleActivitiesCount + 10);
  };

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
          Kommande Aktiviteter
        </Heading>

        {/* Using SimpleGrid for responsive cards */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          {activities.slice(0, visibleActivitiesCount).map((activity, index) => (
            <Box key={activity.activity_id} borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="white">
              <Flex justify="space-between" align="center" mb={2}>
                <Tag size="lg" colorScheme="teal" borderRadius="full">
                  <TagLabel>{activity.scout_level}</TagLabel>
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
                {format(parseISO(activity.dtstart), 'P p')}
              </Text>
              <Text>{activity.location}</Text>
              <Text mt={2}>{activity.summary.split('//')[0]}</Text>

              {/* Available Carpools Collapse */}
              <Collapse in={openCarpoolIndex === index} animateOpacity>
                <Box mt={2}>
                  <VStack spacing={4}>
                    <Button
                      leftIcon={<FaPlus />}
                      colorScheme="brand"
                      size="sm"
                      onClick={() => openCarpoolModal(activity.activity_id)} // Open modal instead of navigating
                    >
                      Lägg till Carpool
                    </Button>

                    {/* Display existing carpools */}
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
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontSize="md" color="brand.600">
                                {carpool.departure_address} - {carpool.departure_city} ({carpool.carpool_type})
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Tillgängliga Platser: {carpool.available_seats}
                              </Text>
                            </Box>
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

        {/* Load More Button */}
        <Button mt={4} onClick={handleLoadMore} colorScheme="teal">
          Ladda fler ↓
        </Button>
      </Box>

      {/* Modal for Carpool Registration */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrera Carpool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CarpoolComponent activityId={selectedActivityId} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Stäng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DashBoardParent;
