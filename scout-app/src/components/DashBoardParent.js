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
} from '@chakra-ui/react';
import { FaUserCircle, FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns'; // Import date-fns for date formatting

const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCarpoolIndex, setOpenCarpoolIndex] = useState(null);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10);
  const navigate = useNavigate();
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

  // Toggle carpool visibility
  const toggleCarpool = (index) => {
    setOpenCarpoolIndex(openCarpoolIndex === index ? null : index);
  };

  // Handle joining/leaving carpools
  const handleJoinCarpool = async (id, joined) => {
    try {
      const endpoint = joined ? '/api/carpool/leave' : '/api/carpool/join';
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carpool_id: id }),
      });

      if (response.ok) {
        toast({
          title: `Successfully ${joined ? 'left' : 'joined'} carpool.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to join/leave carpool');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update carpool status.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle the booking toggle
  const toggleBooking = (activityId) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) => {
        if (activity.activity_id === activityId) {
          return {
            ...activity,
            booked: !activity.booked, // Toggle booked state
          };
        }
        return activity;
      })
    );
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
                  onClick={() => toggleCarpool(index)}
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
                  <Heading as="h3" size="sm" color="brand.500">Tillgängliga Samåkningar</Heading>
                  <VStack spacing={4} mt={2}>
                    {Array.isArray(activity.carpools) && activity.carpools.length > 0 ? (
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
                            <Button
                              leftIcon={<FaCar />}
                              colorScheme="brand"
                              size="sm"
                              disabled={carpool.available_seats === 0}
                              onClick={() => handleJoinCarpool(carpool.id, carpool.joined)}
                            >
                              {carpool.joined ? 'Lämna' : 'Gå med'}
                            </Button>
                          </Flex>
                          {/* Booking button */}
                          <Button
                            mt={2}
                            colorScheme={carpool.booked ? 'gray' : 'green'}
                            onClick={() => toggleBooking(activity.activity_id)}
                            size="sm"
                          >
                            {carpool.booked ? 'Platser Bokade' : 'Boka'}
                          </Button>
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
    </Box>
  );
};

export default DashBoardParent;
