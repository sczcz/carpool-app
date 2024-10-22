import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  VStack,
  HStack,
  Icon,
  Divider,
  Flex,
  Collapse,
  Tag,
  TagLabel
} from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState(''); 
  const [activities, setActivities] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [openDescriptionIndex, setOpenDescriptionIndex] = useState(null); 
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(10); 
  const navigate = useNavigate();

  useEffect(() => {
    const name = "Användare"; 
    setUserName(name);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/protected/activity/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
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
          setUserName(user.first_name + ' ' + user.last_name);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const toggleDescription = (index) => {
    setOpenDescriptionIndex(openDescriptionIndex === index ? null : index);
  };

  const handleCarpoolRedirect = (activityId) => {
    console.log(`Redirect to carpool for activity with id: ${activityId}`);
    navigate(`/carpool/${activityId}`); // Redirect to carpool page with activityId
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleLoadMore = () => {
    setVisibleActivitiesCount(visibleActivitiesCount + 10);
  };


  if (loading) {
    return <Text>Laddar aktiviteter...</Text>;
  }

  if (error) {
    return <Text>Fel vid hämtning av aktiviteter: {error}</Text>;
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
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Scoutlevel</Th>
              <Th>Datum & Tid</Th>
              <Th>Plats</Th>
              <Th>Beskrivning</Th>
              <Th>Samåkning</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.slice(0, visibleActivitiesCount).map((activity, index) => (
              <React.Fragment key={activity.activity_id}>
                <Tr onClick={() => toggleDescription(index)} style={{ cursor: 'pointer' }}>
                  <Td>
                    <Tag size="lg" colorScheme="teal" borderRadius="full">
                      <TagLabel>{capitalizeFirstLetter(activity.scout_level)}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>{new Date(activity.dtstart).toLocaleDateString()} {new Date(activity.dtstart).toLocaleTimeString()}</Td>
                  <Td>{activity.location}</Td>
                  <Td>{activity.summary.split('//')[0]}</Td>
                  <Td>
                    <Button colorScheme="brand" size="sm" onClick={() => handleCarpoolRedirect(activity.activity_id)}>
                      Samåkning
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={5}>
                    <Collapse in={openDescriptionIndex === index} animateOpacity>
                      <Box p={4} color="gray.600" borderWidth="1px" borderRadius="lg">
                        {activity.description}
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>

        {/* Render "Ladda fler" button regardless of condition */}
        <Button mt={4} onClick={handleLoadMore} colorScheme="teal">
          Ladda fler ↓
        </Button>
      </Box>
    </Box>
  );
};

export default DashBoardParent;
