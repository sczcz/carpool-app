import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  VStack,
  Box,
  Tag,
  Icon,
  TagLabel,
  useBreakpointValue,
  HStack,
  IconButton,
  Stack,
} from '@chakra-ui/react';
import { FaFlag, FaClock, FaMapMarkerAlt, FaInfoCircle, FaTrash, FaUser } from 'react-icons/fa';

const CarpoolDetails = ({ isOpen, onClose, currentUserId, activity, carpool, handleRemoveFromCarpool }) => {
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'lg', md: 'lg' });

  const handleUnbook = (childId) => {
    if (window.confirm(`Are you sure you want to unbook child ID: ${childId}?`)) {
      handleRemoveFromCarpool(carpool.id, activity.activity_id, childId);
    }
  };

  const isParentOfChild = (passenger) => {
    return passenger.parent_1_id === currentUserId || passenger.parent_2_id === currentUserId;
  };

  const roleColors = {
    tumlare: 'blue.400',
    kutar: 'cyan.400',
    upptäckare: 'green.400',
    äventyrare: 'yellow.400',
    utmanare: 'orange.400',
    rover: 'purple.400',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent maxW={{ base: '90%', md: '800px' }} mx="auto">
        <ModalHeader fontSize={{ base: 'lg', md: 'xl' }} textAlign="center">
          {carpool.departure_city} - {activity.location}
        </ModalHeader>
        <HStack justify="center" mb={2}>
          <Tag
            color="white"
            backgroundColor={roleColors[activity.scout_level] || 'gray.200'}
            size="lg"
            fontWeight="bold"
            alignSelf="center"
          >
            <Icon as={FaFlag} mr={1} />
            <TagLabel>{activity.scout_level}</TagLabel>
          </Tag>
        </HStack>
        <ModalCloseButton size="sm" />
        <ModalBody p={{ base: 4, md: 6 }}> {/* Adjusted padding for mobile */}
          <HStack spacing={{ base: 4, md: 8 }} align="start" w="full" flexDirection={{ base: 'column', md: 'row' }} justify="center"> {/* Centered layout */}
            {/* Left Section for Carpool Information and Passenger List */}
            <VStack align="start" spacing={4} flex={1} w="full" px={{ base: 4, md: 0 }}> {/* Added padding to the sides */}
              {/* Carpool Information Section */}
              <Text fontWeight="bold" fontSize={fontSize} mt={4}>
                Carpool Information:
              </Text>
              <Box w="full">
                <Text fontSize={fontSize}>
                  <strong>Departure Address:</strong> {carpool?.departure_address || 'N/A'}
                </Text>
                <Text fontSize={fontSize}>
                  <strong>Available Seats:</strong> {carpool?.available_seats || 'N/A'}
                </Text>
                <Text fontSize={fontSize}>
                  <strong>Carpool Type:</strong> {carpool?.carpool_type || 'N/A'}
                </Text>
              </Box>

              {/* Passenger List Section */}
              <Text fontWeight="bold" fontSize={fontSize} mt={4}>Passengers:</Text>
              <Box 
                w="full" 
                maxH={{ base: '200px', md: '300px' }} // Set max height for the scrollable area
                overflowY="auto" // Enable vertical scrolling
                borderWidth={1}
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
                p={2}
              >
                <Stack spacing={3} w="full">
                  {carpool.passengers && carpool.passengers.length > 0 ? (
                    carpool.passengers.map((passenger, index) => (
                      <Box key={index} w="full" p={3} borderRadius="md" bg="white" boxShadow="sm">
                        <HStack spacing={2} justifyContent="space-between">
                          <HStack spacing={2}>
                            <Icon as={FaUser} color="gray.500" />
                            <Text fontSize="sm" fontWeight="bold">Namn:</Text>
                            <Text fontSize="sm">{passenger.name || 'Unknown'}</Text>
                          </HStack>
                        
                          {/* Show "Leave" button only for parent */}
                          {isParentOfChild(passenger) && (
                            <IconButton
                              icon={<FaTrash />}
                              colorScheme="red"
                              aria-label="Remove child from carpool"
                              onClick={() => handleUnbook(passenger.child_id)}
                              variant="outline"
                              size="sm"
                              ml={3}
                            />
                          )}
                        </HStack>
                        <Stack spacing={1} mt={2}>
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold">Telefon:</Text>
                            <Text fontSize="sm">{passenger.phone || 'N/A'}</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold">Vårdnadshavare:</Text>
                            <Text fontSize="sm">{passenger.parent1_name || 'N/A'}</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold">Telefon:</Text>
                            <Text fontSize="sm">{passenger.parent1_phone || 'N/A'}</Text>
                          </HStack>
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">No passengers found.</Text>
                  )}
                </Stack>
              </Box>
            </VStack>

            {/* Right Section for Activity Details */}
            <Box flex={1} w="full" mt={{ base: 4, md: 0 }} px={{ base: 4, md: 0 }}> {/* Added padding to the sides */}
              <Text fontWeight="bold" fontSize={fontSize} mt={4}>
                Activity Details:
              </Text>
              <Box w="full">
                <Text fontSize="sm" color="gray.500" mb={1}>
                  <Icon as={FaMapMarkerAlt} mr={1} /> Location:
                </Text>
                <Text fontSize={fontSize}>{activity.location}</Text>

                <Text fontSize="sm" color="gray.500" mt={3}>
                  <Icon as={FaClock} mr={1} /> Start Time:
                </Text>
                <Text fontSize={fontSize}>{activity.dtstart}</Text>

                <Text fontSize="sm" color="gray.500" mt={3}>
                  <Icon as={FaInfoCircle} mr={1} /> Description:
                </Text>
                <Text fontSize={fontSize}>{activity.description}</Text>
              </Box>
            </Box>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CarpoolDetails;
