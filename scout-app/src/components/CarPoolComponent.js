import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Button,
  useToast,
  Spinner,
  useBreakpointValue,
} from '@chakra-ui/react';

const CarpoolComponent = ({ activityId }) => {
  const [newCar, setNewCar] = useState({
    from: '',
    destination: '',
    spots: '',
    departure_postcode: '',
    departure_city: '',
    car_id: '',
    carpool_type: 'drop-off',
  });
  const [cars, setCars] = useState([]); // Lista över bilar för val
  const [loading, setLoading] = useState(false); // Laddningsstatus för registrering
  const toast = useToast();

  // Responsiva grid-kolumner: 1fr på små skärmar, 1fr 1fr på större skärmar
  const gridTemplateColumns = useBreakpointValue({ base: '1fr', md: '1fr 1fr' });

  // Hämta tillgängliga bilar för användaren
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/protected/get-cars', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars); // Sätt bilar från svaret
        } else {
          throw new Error('Misslyckades med att hämta bilar');
        }
      } catch (error) {
        console.error('Fel vid hämtning av bilar:', error);
        toast({
          title: 'Fel vid hämtning av bilar',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchCars();
  }, [toast]);

  // Validera och registrera carpools
  const handleCarRegistration = async () => {
    if (!newCar.from || !newCar.destination || !newCar.spots || !newCar.car_id || !newCar.departure_postcode || !newCar.departure_city) {
      toast({
        title: 'Fel',
        description: 'Fyll i alla obligatoriska fält.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true); // Starta laddning vid registrering
    try {
      const response = await fetch('/api/carpool/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: 1, // Ersätt med verkligt användar-ID från kontext eller auth
          car_id: newCar.car_id,
          activity_id: activityId,
          available_seats: parseInt(newCar.spots),
          departure_address: newCar.from,
          departure_postcode: newCar.departure_postcode,
          departure_city: newCar.departure_city,
          carpool_type: newCar.carpool_type,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Samåkning skapad.',
          description: 'Din samåkning har skapats.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Återställ formuläret efter framgång
        setNewCar({
          from: '',
          destination: '',
          spots: '',
          car_id: '',
          carpool_type: 'drop-off',
          departure_postcode: '',
          departure_city: '',
        });
      } else {
        throw new Error('Misslyckades med att skapa samåkning');
      }
    } catch (error) {
      console.error('Fel vid registrering:', error);
      toast({
        title: 'Fel',
        description: 'Misslyckades med att registrera samåkning.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Stoppa laddning när det är klart
    }
  };

  return (
    <Box p={{ base: 2, md: 5 }}>
      <Heading as="h3" size="lg" mb={4}>
        Registrera ny samåkning
      </Heading>

      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={4}>
          <Grid templateColumns={gridTemplateColumns} gap={4} w="100%">
            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Från</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Avreseadress"
                  value={newCar.from}
                  onChange={(e) => setNewCar({ ...newCar, from: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Destination</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Destination"
                  value={newCar.destination}
                  onChange={(e) => setNewCar({ ...newCar, destination: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Avresans postnummer</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Postnummer"
                  value={newCar.departure_postcode}
                  onChange={(e) => setNewCar({ ...newCar, departure_postcode: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Avresans stad</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Stad"
                  value={newCar.departure_city}
                  onChange={(e) => setNewCar({ ...newCar, departure_city: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Antal tillgängliga platser</FormLabel>
                <NumberInput
                  size="sm"
                  min={1}
                  value={newCar.spots}
                  onChange={(value) => setNewCar({ ...newCar, spots: value })}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl id="car_id">
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Välj bil</FormLabel>
                <Select
                  size="sm"
                  placeholder="Välj en bil"
                  value={newCar.car_id}
                  onChange={(e) => setNewCar({ ...newCar, car_id: e.target.value })}
                >
                  {cars.map((car) => (
                    <option key={car.car_id} value={car.car_id}>
                      {car.model_name} ({car.reg_number})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Typ av samåkning</FormLabel>
                <Select
                  size="sm"
                  value={newCar.carpool_type}
                  onChange={(e) => setNewCar({ ...newCar, carpool_type: e.target.value })}
                >
                  <option value="drop-off">Avlämning</option>
                  <option value="pick-up">Upphämtning</option>
                  <option value="both">Båda</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
          <Button
            colorScheme="blue"
            onClick={handleCarRegistration}
            isLoading={loading}
            isDisabled={loading}
            size="sm" // Mindre knapp för kompakt vy
            w="100%"  // Knappen sträcker sig till 100% av behållaren på mobiler
          >
            Registrera samåkning
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default CarpoolComponent;
