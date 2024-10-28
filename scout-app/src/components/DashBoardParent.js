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
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import CarpoolComponent from './CarPoolComponent';

const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [joinedChildrenInCarpool, setJoinedChildrenInCarpool] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const name = 'Användare';
    setUserName(name);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [token]);

  const fetchActivities = async () => {
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
      const sortedActivities = data.events.sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
              return { ...activity, carpools: data.carpools };
            }
            return activity;
          })
        );
      } else {
        throw new Error('Failed to fetch carpools');
      }
    } catch (error) {
      toast({
        title: 'Error fetching carpools.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingCarpools(false);
    }
  };

  const toggleCarpool = (index, activityId) => {
    if (openCarpoolIndex === index) {
      setOpenCarpoolIndex(null);
    } else {
      setOpenCarpoolIndex(index);
      fetchCarpoolsForActivity(activityId);
    }
  };

  const openCarpoolModal = (activityId) => {
    setSelectedActivityId(activityId);
    onOpen();
  };

  const handleLoadMore = () => {
    setVisibleActivitiesCount(visibleActivitiesCount + 10);
  };

  const handleJoinCarpool = async (carpoolId, activityId) => {
    try {
        const checkResponse = await fetch(`/api/carpool/check-multiple-children?carpool_id=${carpoolId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        
        const checkData = await checkResponse.json();
        let selectedChildId = -1;
        
        if (checkData.multiple) {
            selectedChildId = prompt(
                `Select child ID:\n${checkData.children.map(child => `${child.child_id}: ${child.name}`).join('\n')}`
            );
            if (!selectedChildId) return; 
        } else {
            selectedChildId = checkData.child_id;
        }

        const selectedCarpool = activities
            .find(activity => activity.activity_id === activityId)
            .carpools.find(carpool => carpool.id === carpoolId);

        if (selectedCarpool.passengers.includes(parseInt(selectedChildId))) {
            toast({
                title: 'Already Joined',
                description: 'This child is already part of the carpool.',
                status: 'info',
                duration: 5000,
                isClosable: true,
            });
            return;
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

        setJoinedChildrenInCarpool(prev => ({
          ...prev,
          [carpoolId]: [...(prev[carpoolId] || []), selectedChildId]
        }));

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
              Kommande Aktiviteter
            </Heading>

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

                  <Collapse in={openCarpoolIndex === index} animateOpacity>
                    <Box mt={2} maxHeight="250px" overflowY="auto">
                      <VStack spacing={4}>
                        <Button
                          leftIcon={<FaPlus />}
                          colorScheme="brand"
                          size="sm"
                          onClick={() => openCarpoolModal(activity.activity_id)}
                        >
                          Lägg till Carpool
                        </Button>

                        {fetchingCarpools ? (
                          <Spinner />
                        ) : Array.isArray(activity.carpools) && activity.carpools.length > 0 ? (
                          activity.carpools.slice(0, 3).map((carpool) => (
                            <Box
                              key={carpool.id}
                              p={4}
                              borderWidth={1}
                              borderRadius="lg"
                              w="100%"
                              bg="gray.50"
                              boxShadow="sm"
                              fontSize={{ base: 'sm', sm: 'md' }}
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
                                
                                {carpool.available_seats > 0 ? (
                                  <Button
                                    colorScheme={joinedChildrenInCarpool[carpool.id]?.length ? 'green' : 'blue'}
                                    size="sm"
                                    onClick={() => handleJoinCarpool(carpool.id, activity.activity_id)}
                                    disabled={joinedChildrenInCarpool[carpool.id]?.length}
                                  >
                                    {joinedChildrenInCarpool[carpool.id]?.length ? 'Joined' : 'Join'}
                                  </Button>
                                ) : (
                                  <Button colorScheme="red" size="sm" isDisabled>
                                    Full
                                  </Button>
                                )}
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


        </Box>
      </Flex>
    </Box>
  );
};

export default DashBoardParent;
