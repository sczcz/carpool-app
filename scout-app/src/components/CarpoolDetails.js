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
  Button
} from '@chakra-ui/react';
import { FaFlag, FaClock, FaMapMarkerAlt, FaInfoCircle, FaUser, FaTrash } from 'react-icons/fa';

const CarpoolDetails = ({ isOpen, onClose, activity, carpool, currentUserId, handleLeaveCarpool }) => {
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'xs', md: 'lg' });

  const isParentOfChild = (passenger) => {
    return passenger.parent_1_id === currentUserId || passenger.parent_2_id === currentUserId;
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent maxW={{ base: '90%', md: '600px' }} mx="auto">
        <ModalHeader fontSize={{ base: 'lg', md: 'xl' }} textAlign="center">
          {carpool.departure_city} - {activity.location}
        </ModalHeader>
        <HStack justify="center" mb={2}>
          <Tag colorScheme="blue" size="lg" fontWeight="bold" alignSelf="center">
            <Icon as={FaFlag} mr={1} />
            <TagLabel>{activity.scout_level}</TagLabel>
          </Tag>
        </HStack>
        <ModalCloseButton size="sm" />
        <ModalBody p={{ base: 2, md: 4 }}>
          <VStack align="start" spacing={{ base: 3, md: 4 }}>
            <Text fontWeight="bold" fontSize={fontSize}>Activity Details:</Text>
            <Box w="100%">
              <Text fontSize="sm" color="gray.500" mb={1}><Icon as={FaMapMarkerAlt} mr={1} /> Location:</Text>
              <Text fontSize={fontSize}>{activity.location}</Text>

              <Text fontSize="sm" color="gray.500" mt={3}><Icon as={FaClock} mr={1} /> Start Time:</Text>
              <Text fontSize={fontSize}>{activity.dtstart}</Text>

              <Text fontSize="sm" color="gray.500" mt={3}><Icon as={FaInfoCircle} mr={1} /> Description:</Text>
              <Text fontSize={fontSize}>{activity.description}</Text>
            </Box>

            <Text fontWeight="bold" fontSize={fontSize} mt={{ base: 4, md: 6 }}>Carpool Information:</Text>
            <Box w="100%">
              <Text fontSize={fontSize}><strong>Departure Address:</strong> {carpool.departure_address}</Text>
              <Text fontSize={fontSize}><strong>Available Seats:</strong> {carpool.available_seats}</Text>
              <Text fontSize={fontSize}><strong>Carpool Type:</strong> {carpool.carpool_type}</Text>
            </Box>

            {/* Passenger List */}
            <Text fontWeight="bold" fontSize={fontSize} mt={{ base: 4, md: 6 }}>Passengers:</Text>
            <VStack w="100%" align="start" spacing={2}>
              {carpool.passengers && carpool.passengers.length > 0 ? (
                carpool.passengers.map((passenger, index) => (
                  <Box key={index} w="100%" p={2} borderRadius="md" bg="gray.50" boxShadow="sm">
                    <HStack spacing={2} justifyContent="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaUser} color="gray.500" />
                        <Text fontSize="sm" fontWeight="bold">Namn:</Text>
                        <Text fontSize="sm">{passenger.name || 'Unknown'}</Text>
                      </HStack>
                    
                      {/* Visa "Leave" knapp bara för föräldern */}
                      {isParentOfChild(passenger) && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => handleLeaveCarpool(passenger.child_id)}
                          leftIcon={<FaTrash />}
                        >
                          Lämna
                        </Button>
                      )}
                    </HStack>
                    <HStack spacing={2} mt={1}>
                      <Text fontSize="sm" fontWeight="bold">Telefon:</Text>
                      <Text fontSize="sm">{passenger.phone || 'N/A'}</Text>
                    </HStack>
                    <HStack spacing={2} mt={1}>
                      <Text fontSize="sm" fontWeight="bold">Vårdnadshavare:</Text>
                      <Text fontSize="sm">{passenger.parent1_name}</Text>
                    </HStack>
                    <HStack spacing={2} mt={1}>
                      <Text fontSize="sm" fontWeight="bold">Telefon:</Text>
                      <Text fontSize="sm">{passenger.parent1_phone || 'N/A'}</Text>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">No passengers found.</Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CarpoolDetails;
