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
  HStack
} from '@chakra-ui/react';
import { FaFlag, FaClock, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

const CarpoolDetails = ({ isOpen, onClose, activity, carpool }) => {
  // Responsive settings for font sizes and modal size
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'xs', md: 'lg' });

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
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CarpoolDetails;
