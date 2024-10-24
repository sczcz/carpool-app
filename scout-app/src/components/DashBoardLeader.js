import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  Collapse,
  Spinner,
  useToast,
  Select
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const Dashboard = ({ token }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openActivityId, setOpenActivityId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3); // Startar med 3
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Alla roller'); // Filtrering
  const toast = useToast();

  // Hämta aktiviteter från API när komponenten laddas
  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Funktion för att hämta aktiviteter
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att hämta samåkningar för en specifik aktivitet
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

  const toggleActivity = (activityId) => {
    setOpenActivityId(openActivityId === activityId ? null : activityId);
    if (openActivityId !== activityId) {
      fetchCarpoolsForActivity(activityId); // Ladda samåkningar när aktivitet öppnas
    }
  };

  const loadMoreActivities = () => {
    setVisibleCount((prevCount) => prevCount + 3); // Ladda tre nya varje gång
  };

  // Filtrering av aktiviteter baserat på scout_level
  const filteredActivities = activities.filter((activity) => {
    if (selectedRole === 'Alla roller') {
      return true; // Visa alla om ingen specifik roll är vald
    }
    return activity.scout_level === selectedRole; // Visa bara aktiviteter som matchar vald roll
  });

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value); // Uppdatera vald roll
    setVisibleCount(3); // Återställ till 3 synliga aktiviteter vid rollbyte
  };

  // Hämta unika roller för dropdown
  const uniqueRoles = [...new Set(activities.map(activity => activity.scout_level))];

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
    <Flex direction="column" align="center" justify="center" p={8}>
      <Heading as="h1" size="xl" mb={8} color="brand.500">
        Dashboard för ledare
      </Heading>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={6}
        width="100%"
        maxW="1200px"
      >
        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Användare
            </Heading>
            <Text fontSize="xl" color="brand.500">Totalt: 123</Text>
            <Text fontSize="md" color="brand.400">Aktiva användare: 89</Text>
          </Box>
        </GridItem>

        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Notifikationer
            </Heading>
            <Text fontSize="xl" color="brand.500">Nya notifikationer: 5</Text>
            <Text fontSize="md" color="brand.400">Olästa: 3</Text>
          </Box>
        </GridItem>

        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Transporter
            </Heading>
            <Text fontSize="xl" color="brand.500">Samåkningar: 12</Text>
            <Text fontSize="md" color="brand.400">Kommande transporter: 4</Text>
          </Box>
        </GridItem>

        <GridItem w="100%" colSpan={{ base: 1, md: 2, lg: 3 }}>
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Aktiviteter
            </Heading>

            {/* Rollfiltrering */}
            <Select placeholder="Välj roll" onChange={handleRoleChange} mb={6} value={selectedRole}>
              <option value="Alla roller">Alla roller</option>
              {uniqueRoles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </Select>

            {filteredActivities.length === 0 ? (
              <Text fontSize="md" color="brand.400">
                Inga aktiviteter tillgängliga för denna roll.
              </Text>
            ) : (
              <>
                {filteredActivities.slice(0, visibleCount).map((activity) => (
                  <Box key={activity.activity_id} bg="white" p={4} mt={4} borderRadius="md" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="bold" color="brand.600">{activity.summary}</Text>
                    <Text fontSize="md" color="brand.500">
                      Plats: {activity.location}
                    </Text>
                    <Text fontSize="md" color="brand.500">Datum: {new Date(activity.dtstart).toLocaleString()}</Text>

                    <Button
                      mt={2}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => toggleActivity(activity.activity_id)}
                      rightIcon={openActivityId === activity.activity_id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    >
                      {openActivityId === activity.activity_id ? 'Dölj samåkningar' : 'Visa samåkningar'}
                    </Button>

                    <Collapse in={openActivityId === activity.activity_id}>
                      <Box mt={4}>
                        {activity.carpools ? (
                          activity.carpools.length > 0 ? (
                            activity.carpools.map((carpool) => (
                              <Text key={carpool.id} color="brand.400">
                                {carpool.description}
                              </Text>
                            ))
                          ) : (
                            <Text>Inga tillgängliga samåkningar.</Text>
                          )
                        ) : (
                          <Text>Laddar samåkningar...</Text>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}

                {visibleCount < filteredActivities.length && (
                  <Button mt={6} onClick={loadMoreActivities} colorScheme="teal">
                    Ladda fler
                  </Button>
                )}
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Flex>
  );
};

export default Dashboard;
