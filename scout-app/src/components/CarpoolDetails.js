// CarpoolDetails.js
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
  Button,
  IconButton,
  SimpleGrid, // Import SimpleGrid for responsive layout
} from '@chakra-ui/react';
import { FaFlag, FaClock, FaMapMarkerAlt, FaInfoCircle, FaTrash, FaUser } from 'react-icons/fa';

const CarpoolDetails = ({ isOpen, onClose, activity, carpool, currentUserId, handleRemoveFromCarpool }) => {
  // Responsive settings for font sizes and modal size
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'xs', md: 'lg' });

  const handleUnbook = (childId) => {
    if (window.confirm(`Are you sure you want to unbook child ID: ${childId}?`)) {
      handleRemoveFromCarpool(carpool.id, activity.activity_id, childId);
    }

    const isParentOfChild = (passenger) => {
      return passenger.parent_1_id === currentUserId || passenger.parent_2_id === currentUserId;
    }

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
      <ModalContent maxW={{ base: '90%', md: '800px' }} mx="auto"> {/* Increased max width for wider display */}
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
        <ModalBody p={{ base: 4, md: 6 }}>
          <HStack spacing={8} align="start" w="full"> {/* Changed to HStack for horizontal layout */}
            {/* Left Section for Carpool Information and Booked Children */}
            <VStack align="start" spacing={{ base: 4, md: 5 }} flex={1}>
              {/* Carpool Information Section */}
              <Text fontWeight="bold" fontSize={fontSize} mt={{ base: 4, md: 6 }}>
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

              {/* Booked Children Section */}
              <Text fontWeight="bold" fontSize={fontSize} mt={{ base: 4, md: 6 }}>
                Booked Children:
              </Text>
              <VStack spacing={3} align="start" w="full">
                {Array.isArray(carpool?.passengers) && carpool.passengers.length > 0 ? (
                  carpool.passengers.map((childId) => (
                    <Box
                      key={childId}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      width="full"
                      boxShadow="md"
                      _hover={{ boxShadow: 'lg' }}
                    >
                      <Text fontSize={fontSize}>Child ID: {childId}</Text>
                      <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        aria-label="Remove child from carpool"
                        onClick={() => handleUnbook(childId)}
                        variant="outline"
                        size="sm"
                        ml={3}
                      />
                    </Box>
                  ))
                ) : (
                  <Text>No children booked for this carpool.</Text>
                )}
              </VStack>
            </VStack>

            {/* Right Section for Activity Details */}
            <Box flex={1} w="full">
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
