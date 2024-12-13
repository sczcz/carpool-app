import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Box,
  useDisclosure,
} from '@chakra-ui/react';

const SelectParticipantModal = ({ isOpen, onClose, participants, onSelect }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Välj deltagare</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
            {participants.map((participant) => (
                <Box
                  key={`${participant.name}-${participant.id}`} // Kombinerar namn och ID för att skapa en unik nyckel
                  w="100%"
                  p={4}
                  borderRadius="md"
                  bg={participant.is_booked ? 'red.100' : 'green.100'}
                  cursor={participant.is_booked ? 'not-allowed' : 'pointer'}
                  onClick={() => {
                    if (!participant.is_booked) {
                      onSelect(participant);
                    }
                  }}
                  _hover={{
                    bg: participant.is_booked ? 'red.200' : 'green.200',
                  }}
                >
                  <Text fontWeight="bold">{participant.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {participant.is_booked ? 'Redan bokad' : 'Tillgänglig'}
                  </Text>
                </Box>
              ))}

            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" onClick={onClose}>
              Stäng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default SelectParticipantModal;
  
