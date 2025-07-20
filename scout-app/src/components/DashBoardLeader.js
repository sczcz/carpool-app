import React, { useState, useEffect } from 'react';
import { InfoIcon } from '@chakra-ui/icons';
import { FaPlus } from "react-icons/fa";
import {
  Box,
  Tag,
  TagLabel,
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
  Select,
  IconButton, 
  Popover, 
  PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import useRoleProtection from "../utils/useRoleProtection";
import CreateActivityModal from "./CreateActivityModal";

const Dashboard = ({ token }) => {
  useRoleProtection(["admin", "ledare"]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openActivityId, setOpenActivityId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Alla roller');
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',     
    upptäckare: '#00a8e1', 
    äventyrare: '#e95f13', 
    utmanare: '#da005e',   
    rover: '#e2e000',
    vuxenscout: '#5353ec',
    ledare: '#003660'        
  };

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
      const sortedActivities = data.events
        .map((activity) => ({
          ...activity,
          isVisible: activity.is_visible,
        }))
        .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const toggleActivityVisibility = async (activityId, isVisible) => {
    const endpoint = isVisible
      ? `/api/protected/activity/remove/${activityId}`
      : `/api/protected/activity/make_visible/${activityId}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Misslyckades med att uppdatera aktivitetens synlighet');
      }

      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.activity_id === activityId
            ? { ...activity, isVisible: !isVisible }
            : activity
        )
      );

      toast({
        title: `Aktiviteten har nu blivit ${!isVisible ? 'synlig' : 'dold'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ett fel uppstod vid ändring av synligheten.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleActivity = (activityId) => {
    setOpenActivityId(openActivityId === activityId ? null : activityId);
    if (openActivityId !== activityId) {
      fetchCarpoolsForActivity(activityId);
    }
  };

  const loadMoreActivities = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  const filteredActivities = activities.filter((activity) => {
    if (selectedRole === 'Alla roller') {
      return true;
    }
    return activity.scout_level === selectedRole;
  });

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setVisibleCount(3);
  };

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

  const handleActivityCreated = () => {
    fetchActivities();
  };

  return (
  <Flex direction="column" align="center" justify="center" p={4} width="100%" overflowX="hidden">
  <Flex justify="space-between" align="center" width="100%" maxW="1200px" mb={8}>
  <Heading as="h1" size={{ base: 'lg', md: 'xl' }} color="brand.500">
      Ledare
    </Heading>
  </Flex>

  <Grid
    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
    gap={{ base: 4, md: 6 }}
    px={{ base: 2, md: 4 }}
    width="100%"
    maxW="1200px"
  >


        <GridItem w="100%" colSpan={{ base: 1, md: 2, lg: 3 }}>
        <Box mb={6} display="flex" flexDirection={{ base: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" width="100%" fontSize={{ base: 'sm', md: 'md' }}>
            <Flex align="center">
              <Heading as="h3" size="lg" color="brand.500">
                Aktiviteter
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
                <PopoverContent border={'solid'}>
                  <PopoverArrow />
                  <PopoverBody>
                    <Text mb={2}>
                      Här kan du hantera aktiviteter som du är ansvarig för som ledare. 
                    </Text>
                    <Text mb={2}>
                      Du kan ändra synligheten för aktiviteter så att de blir synliga eller dolda för användare.
                    </Text>
                    <Text>
                      Dessutom kan du filtrera aktiviteter baserat på de roller du har tilldelats för att enkelt hantera specifika aktiviteter.
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>

            <Button
              rightIcon={<FaPlus />}
              color="brand.500"
              fontWeight="bold"
              variant="link"
              fontSize={{ base: 'sm', md: 'md' }}
              onClick={() => setIsModalOpen(true)}
              _hover={{ textDecoration: "underline", color: "blue.700" }}
            >
              Skapa ny aktivitet
            </Button>
          </Box>

            <CreateActivityModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onActivityCreated={handleActivityCreated}
            />
              <Select onChange={handleRoleChange} mb={6} value={selectedRole}>
                <option value="Alla roller">Alla roller</option>
                {uniqueRoles.map((role, index) => (
                  <option key={index} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>

  
            {filteredActivities.length === 0 ? (
              <Text fontSize="md" color="brand.400">
                Inga aktiviteter tillgängliga för denna roll.
              </Text>
            ) : (
              <>
              {filteredActivities.slice(0, visibleCount).map((activity) => (
                <Box key={activity.activity_id} bg="white" p={4} mt={4} borderRadius="md" boxShadow="lg">
                  <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" width="100%">
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                    color="brand.600"
                    noOfLines={1}
                  >
                    {activity.summary.split('//')[0].trim()}
                  </Text>
                  <Tag
                    ml={{ base: 0, md: 4 }}
                    size={{ base: 'sm', md: 'lg' }}
                    color="white"
                    backgroundColor={roleColors[activity.scout_level] || 'gray.200'}
                  >
                    <TagLabel fontSize={{ base: 'sm', md: 'md' }}>
                      {activity.scout_level.charAt(0).toUpperCase() + activity.scout_level.slice(1)}
                    </TagLabel>
                  </Tag>
                </Flex>

                  <Text fontSize={{ base: 'sm', md: 'md' }} color="brand.500">Plats: {activity.location}</Text>
                  <Text fontSize="md" color="brand.500">Datum: {new Date(activity.dtstart).toLocaleString()}</Text>
                  <Text fontSize="md" color="brand.400">
                    Status: {activity.isVisible ? 'Synlig' : 'Dold'}
                  </Text>

                  <Button
                    mt={2}
                    size="sm"
                    colorScheme="blue"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    onClick={() => toggleActivity(activity.activity_id)}
                    rightIcon={openActivityId === activity.activity_id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  >
                    {openActivityId === activity.activity_id ? 'Dölj samåkningar' : 'Visa samåkningar'}
                  </Button>

                  <Button
                    mt={2}
                    ml={{ base: 0, sm:4  }}                    
                    size="sm"
                    colorScheme={activity.isVisible ? 'red' : 'green'}
                    onClick={() => toggleActivityVisibility(activity.activity_id, activity.isVisible)}
                  >
                    {activity.isVisible ? 'Dölj aktivitet för användare' : 'Visa aktivitet för användare'}
                  </Button>

                  <Collapse in={openActivityId === activity.activity_id}>
  <Box mt={4}>
    {activity.carpools ? (
      activity.carpools.length > 0 ? (
        activity.carpools.map((carpool) => (
          <Box
            key={carpool.id}
            p={4}
            bg="gray.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
            mb={4}
          >
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="lg" color="brand.600">
                Förare: {carpool.driver_name || "Ingen förare tillgänglig"}
              </Text>
              {carpool.driver_phone && (
                <Text color="brand.500" fontSize="sm">
                  Telefon: {carpool.driver_phone}
                </Text>
              )}
            </Box>

            <Box mb={4}>
              <Text fontWeight="bold" fontSize="md" color="gray.700">
                Avresa från:
              </Text>
              <Text fontSize="sm" color="gray.600">
                {carpool.departure_address || "Ingen adress tillgänglig"},{" "}
                {carpool.departure_city || "Ingen stad tillgänglig"}
              </Text>
            </Box>

            <Box mb={4}>
              <Text fontSize="sm" color="gray.600">
                Typ av samåkning: {translateCarpoolType(carpool?.carpool_type) || "N/A"}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Tillgängliga platser: {carpool.available_seats || 0}
              </Text>
            </Box>

            {/* This is the passenger section */}
            <Box>
              <Text fontWeight="bold" fontSize="md" color="gray.700" mb={2}>
                Passagerare:
              </Text>
              {carpool.passengers && carpool.passengers.length > 0 ? (
                carpool.passengers.map((passenger, index) => (
                  <Box key={index} ml={4} mb={3} p={2} bg="white" borderRadius="md" boxShadow="xs">
                    <Text fontWeight="bold" fontSize="sm">
                      Namn:{" "}
                      {passenger.type === "user"
                        ? passenger.name || "Okänd användare"
                        : passenger.name || "Okänt barn"}
                    </Text>
                    <Text fontSize="sm">
                      Telefon: {passenger.phone || "Ingen telefon tillgänglig"}
                    </Text>
                    {passenger.type === "child" && passenger.parents?.length > 0 && (
                      <Box mt={2}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">
                          Vårdnadshavare:
                        </Text>
                        {passenger.parents.map((parent, idx) => (
                          <Text key={idx} fontSize="sm" color="gray.500" ml={2}>
                            {parent.parent_name || "Okänd"} - {parent.parent_phone || "Ingen telefon"}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">
                  Inga passagerare
                </Text>
              )}
            </Box>
          </Box>
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
                     Ladda fler ↓
                  </Button>
                )}
              </>
            )}
        </GridItem>
      </Grid>
    </Flex>
  );

 
};

export default Dashboard;

