import React, { useState, useEffect } from 'react';
import { useCarpool } from '../utils/CarpoolContext';
import { useUser } from '../utils/UserContext';
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
  useToast
} from '@chakra-ui/react';
import { FaFlag, FaClock, FaMapMarkerAlt, FaInfoCircle, FaTrash, FaUser } from 'react-icons/fa';
import ExpandableText from './ExpandableText';
import { format, parseISO } from 'date-fns';

const CarpoolDetails = ({activity, carpool, onClose, isOpen, fetchCarpoolsForActivity}) => {



  const {
    userId: currentUserId
  } = useUser();
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const modalSize = useBreakpointValue({ base: 'lg', md: 'lg' });
  const toast = useToast();
  const carpoolId = carpool.id;
  const activityLoaded = activity;

  const [passengers, setPassengers] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);

  useEffect(() => {
    if (carpool) {
      console.log('FRÅN CARPOOLDETAILS, CARPOOL FINNS: ', carpool) // Funkar och ID finns
      console.log('INFO OM AKTIVITETEN FRÅN CARPOOLDETAILS: ', activity) // Funkar och ID finns
      fetchPassengers();
      fetchDriverInfo();
    }
  }, [carpool]);

  const fetchPassengers = async () => {
    try {
      const response = await fetch(`/api/carpool/${carpoolId}/passengers`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setPassengers(data.passengers);
      } else {
        throw new Error('Kunde inte hämta passagerare');
      }
    } catch (error) {
      console.error('Fel vid hämtning av passagerare', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte hämta passagerare',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchDriverInfo = async () => {
    try {
      const response = await fetch(`/api/carpool/${carpoolId}/driver`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setDriverInfo(data.driver);
      } else {
        throw new Error('Det gick inte att hämta förarinformationen');
      }
    } catch (error) {
      console.error('Fel vid hämtning av förarinformation', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte hämta förarinformation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUnbook = async (id, type) => {
    try {
      const payload = {
        carpool_id: carpoolId,
        ...(type === 'user' ? { user_id: id } : { child_id: id }),
      };
  
      const response = await fetch(`/api/carpool/remove-passenger`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error('Misslyckades med att ta bort från samåkning');
  
      toast({
        title: 'Borttagen från samåkning',
        description: type === 'user'
          ? 'Du har framgångsrikt tagits bort från samåkningen!'
          : 'Barnet har framgångsrikt tagits bort från samåkningen!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      // Uppdatera passagerarlistan i frontend
      setPassengers((prevPassengers) =>
        type === 'user'
          ? prevPassengers.filter((p) => p.user_id !== id)
          : prevPassengers.filter((p) => p.child_id !== id)
      );
  
      // Hämta uppdaterade carpools
      await fetchCarpoolsForActivity(activity.activity_id);
    } catch (error) {
      toast({
        title: 'Fel',
        description: error.message || 'Kan inte ta bort från samåkning',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  

  const isParentOfChild = (passenger) => {
    return passenger.parents && passenger.parents.some((parent) => parent.parent_id === currentUserId);
  };

  const translateCarpoolType = (type) => {
    switch (type) {
      case 'drop-off':
        return 'Avresa';
      case 'pick-up':
        return 'Hemresa';
      case 'both':
        return 'Avresa och Hemresa';
      default:
        return 'Okänd';
    }
  };

  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',
    upptäckare: '#00a8e1',
    äventyrare: '#e95f13',
    utmanare: '#da005e',
    rover: '#e2e000',
  };

  if (!activity || !activity.scout_level) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detaljer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Information om aktiviteten saknas.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
<Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
  <ModalOverlay />
  <ModalContent maxW={{ base: '90%', md: '800px' }} mx="auto">
    <ModalHeader fontSize={{ base: 'lg', md: 'xl' }} textAlign="center">
      {carpool.departure_city} - {activity.location}
    </ModalHeader>
    <HStack justify="center" mb={2}>
      <Tag color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} size="lg" fontWeight="bold" alignSelf="center">
        <Icon as={FaFlag} mr={1} />
        <TagLabel>{activity.scout_level.charAt(0).toUpperCase() + activity.scout_level.slice(1)}</TagLabel>
      </Tag>
    </HStack>
    <ModalCloseButton size="sm" />
    <ModalBody p={{ base: 4, md: 6 }}>
      <HStack spacing={{ base: 4, md: 8 }} align="start" w="full" flexDirection={{ base: 'column', md: 'row' }} justify="center">
        <VStack align="start" spacing={4} flex={1} w="full" px={{ base: 4, md: 0 }}>
          <Text fontWeight="bold" fontSize={fontSize} mt={4}>Samåkningsinformation:</Text>
          <VStack align="start" spacing={1} w="full">
            {/* Driver info */}
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Förare:</Text>
              <Text fontSize={fontSize}>{driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name}` : 'Laddar...'}</Text>
            </HStack>
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Telefon:</Text>
              <Text fontSize={fontSize}>{driverInfo?.phone || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Bil:</Text>
              <Text fontSize={fontSize}>{carpool.car_model_name || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Avgångsadress:</Text>
              <Text fontSize={fontSize}>{carpool?.departure_address || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Tillgängliga platser:</Text>
              <Text fontSize={fontSize}>{carpool?.available_seats || '0'}</Text>
            </HStack>
            <HStack>
              <Text fontSize={fontSize} fontWeight="bold">Typ av samåkning:</Text>
              <Text fontSize={fontSize}>{translateCarpoolType(carpool?.carpool_type) || 'N/A'}</Text>
            </HStack>
          </VStack>

          <Text fontWeight="bold" fontSize={fontSize} mt={4}>Passagerare:</Text>
          <Box w="full" maxH={{ base: '200px', md: '300px' }} overflowY="auto" borderWidth={1} borderColor="gray.200" borderRadius="md" bg="gray.50" p={2}>
            <Stack spacing={3} w="full">
              {passengers.length > 0 ? (
                passengers.map((passenger, index) => (
                  <Box key={index} w="full" p={3} borderRadius="md" bg="white" boxShadow="sm">
                    <HStack spacing={2} justifyContent="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaUser} color="gray.500" />
                        <Text fontSize="sm" fontWeight="bold">Namn:</Text>
                        <Text fontSize="sm">
                          {passenger.type === 'user'
                            ? passenger.user_name || 'Okänd'
                            : passenger.child_name || 'Okänd'}
                        </Text>
                      </HStack>

                      {/* Kontrollera om passageraren är barn och nuvarande användare är en förälder */}
                      {passenger.type === 'child' && isParentOfChild(passenger) && (
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          aria-label="Ta bort barnet från samåkning"
                          onClick={() => handleUnbook(passenger.child_id, 'child')}
                          variant="outline"
                          size="sm"
                          ml={3}
                        />
                      )}

                      {/* Kontrollera om passageraren är användaren själv */}
                      {passenger.type === 'user' && passenger.user_id === currentUserId && (
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          aria-label="Ta bort dig själv från samåkning"
                          onClick={() => handleUnbook(passenger.user_id, 'user')}
                          variant="outline"
                          size="sm"
                          ml={3}
                        />
                      )}
                    </HStack>
                    <Stack spacing={1} mt={2}>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="bold">Telefon:</Text>
                        <Text fontSize="sm">
                          {passenger.type === 'user'
                            ? passenger.user_phone || 'N/A'
                            : passenger.child_phone || 'N/A'}
                        </Text>
                      </HStack>
                      {passenger.type === 'child' && passenger.parents?.length > 0 && (
                        <Box mt={2}>
                          <Text fontSize="sm" fontWeight="bold">Vårdnadshavare:</Text>
                          {passenger.parents.map((parent, idx) => (
                            <Text key={idx} fontSize="sm">
                              {parent.parent_name} - {parent.parent_phone}
                            </Text>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">Inga passagerare hittade.</Text>
              )}
            </Stack>
          </Box>
        </VStack>

        <Box flex={1} w="full" mt={{ base: 4, md: 0 }} px={{ base: 4, md: 0 }}>
          <Text fontWeight="bold" fontSize={fontSize} mt={4}>Aktivitetsdetaljer:</Text>
          <Box w="full">
            <Text fontSize="sm" color="gray.500" mb={1}><Icon as={FaMapMarkerAlt} mr={1} /> Plats:</Text>
            <Text fontSize={fontSize}>{activity.location}</Text>

            <Text fontSize="sm" color="gray.500" mt={3}><Icon as={FaClock} mr={1} /> Start tid:</Text>
            <Text fontSize={fontSize}>
              {activity.dtstart ? format(parseISO(activity.dtstart), "d MMMM 'kl' HH:mm") : 'Datum inte tillgängliga'}
            </Text>

            <Box>
              <Text fontSize="sm" color="gray.500" mt={3}><Icon as={FaInfoCircle} mr={1} /> Beskrivning:</Text>
              <ExpandableText text={activity.description} fontSize={fontSize} />
            </Box>
          </Box>
        </Box>
      </HStack>
    </ModalBody>
  </ModalContent>
</Modal>

  );
};

export default CarpoolDetails;
