import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  Flex,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
} from '@chakra-ui/react';
import { FaCar } from 'react-icons/fa';

const TemporaryCarpoolComponent = () => {
  const [carpoolingOptions, setCarpoolingOptions] = useState([
    { id: 1, date: '2024-10-20', from: 'Jonstorp', to: 'Skogsdungen', spots: 2, joined: false },
    { id: 2, date: '2024-11-05', from: 'Jonstorp', to: 'Scoutstugan', spots: 3, joined: false },
  ]);
  const [showCarForm, setShowCarForm] = useState(false); // Visa eller dölj formuläret
  const [newCar, setNewCar] = useState({ date: '', from: '', to: '', spots: '' });

  // Hantera anmälning eller avanmäling till samåkning
  const handleJoinCarpool = (id) => {
    setCarpoolingOptions(
      carpoolingOptions.map((option) =>
        option.id === id
          ? option.joined
            ? { ...option, spots: option.spots + 1, joined: false } // Avanmäl
            : { ...option, spots: option.spots - 1, joined: true }  // Anmäl
          : option
      )
    );
  };

  // Hantera bilregistrering
  const handleCarRegistration = () => {
    const newCarOption = {
      id: Date.now(), // Generera unikt id
      ...newCar,
      spots: parseInt(newCar.spots), // Konvertera antalet platser till ett nummer
      joined: false, // Initialt har ingen anmält sig
    };
    setCarpoolingOptions([...carpoolingOptions, newCarOption]);
    setNewCar({ date: '', from: '', to: '', spots: '' }); // Nollställ formuläret efter registrering
    setShowCarForm(false); // Dölj formuläret efter registrering
  };

  return (
    <Box p={5}>
      <Divider mb={6} />

      {/* Samåkning */}
      <Box mb={8}>
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
                  disabled={option.spots === 0 && !option.joined} // Avanmäl endast om man redan har anmält sig
                  onClick={() => handleJoinCarpool(option.id)}
                >
                  {option.joined ? 'Avanmäl' : 'Anmäl'}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* Knapp för att visa formuläret för att registrera ny bil */}
      <Box mb={8}>
        <Button colorScheme="brand" onClick={() => setShowCarForm(!showCarForm)}>
          {showCarForm ? 'Dölj' : 'Registrera bil för samåkning'}
        </Button>
        <Collapse in={showCarForm} animateOpacity>
          <Box mt={4}>
            <Heading as="h2" size="md" mb={4} color="brand.500">
              Registrera bil för samåkning
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl id="date">
                <FormLabel>Datum</FormLabel>
                <Input
                  type="date"
                  value={newCar.date}
                  onChange={(e) => setNewCar({ ...newCar, date: e.target.value })}
                />
              </FormControl>
              <FormControl id="from">
                <FormLabel>Från</FormLabel>
                <Input
                  placeholder="Utgångspunkt"
                  value={newCar.from}
                  onChange={(e) => setNewCar({ ...newCar, from: e.target.value })}
                />
              </FormControl>
              <FormControl id="to">
                <FormLabel>Till</FormLabel>
                <Input
                  placeholder="Destination"
                  value={newCar.to}
                  onChange={(e) => setNewCar({ ...newCar, to: e.target.value })}
                />
              </FormControl>
              <FormControl id="spots">
                <FormLabel>Platser</FormLabel>
                <NumberInput min={1} value={newCar.spots} onChange={(value) => setNewCar({ ...newCar, spots: value })}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <Button colorScheme="brand" onClick={handleCarRegistration}>
                Registrera bil
              </Button>
            </VStack>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default TemporaryCarpoolComponent;
