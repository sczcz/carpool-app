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
} from '@chakra-ui/react';
import { FaCar, FaUserCircle } from 'react-icons/fa'; // Behåll den här importen för användarikonen

const DashBoardParent = () => {
  const [userName, setUserName] = useState(''); // State för användarnamn

  // Hämta användarnamn från localStorage när komponenten laddas
  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  const activities = [
    { date: '2024-10-20', location: 'Skogsdungen', status: 'Anmäld' },
    { date: '2024-11-05', location: 'Scoutstugan', status: 'Inte anmäld' },
    { date: '2024-12-01', location: 'Lägerplats', status: 'Anmäld' },
  ];

  const carpoolingOptions = [
    { date: '2024-10-20', from: 'Jonstorp', to: 'Skogsdungen', spots: 2 },
    { date: '2024-11-05', from: 'Jonstorp', to: 'Scoutstugan', spots: 3 },
  ];

  return (
    <Box p={5}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <HStack>
          <Icon as={FaUserCircle} w={8} h={8} color="brand.500" />
          <Heading as="h1" size="lg" color="brand.500">Välkommen, {userName}</Heading>
        </HStack>
      </Flex>

      {/* Välkomstmeddelande */}
      <Box mb={6}>
        <Text fontSize="lg" color="brand.600">
          Hej {userName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
        </Text>
      </Box>

      <Divider mb={6} />

      {/* Kommande aktiviteter */}
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Kommande Aktiviteter
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Datum</Th>
              <Th>Plats</Th>
              <Th>Status</Th>
              <Th>Åtgärd</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.map((activity, index) => (
              <Tr key={index}>
                <Td>{activity.date}</Td>
                <Td>{activity.location}</Td>
                <Td>{activity.status}</Td>
                <Td>
                  <Button colorScheme="brand" size="sm">
                    {activity.status === 'Anmäld' ? 'Ändra' : 'Anmäl'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Divider mb={6} />

      {/* Samåkning */}
      <Box>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Samåkningsmöjligheter
        </Heading>
        <VStack spacing={4}>
          {carpoolingOptions.map((option, index) => (
            <Box
              key={index}
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
                    {option.date}: Från {option.from} till {option.to}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Lediga platser: {option.spots}
                  </Text>
                </Box>
                <Button
                  leftIcon={<FaCar />}
                  colorScheme="brand"
                  size="sm"
                  disabled={option.spots === 0}
                >
                  Anmäl
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default DashBoardParent;
