import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
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
  const [cars, setCars] = useState([]); // List of cars for selection
  const [loading, setLoading] = useState(false); // Loading state for registration
  const toast = useToast();

  // Fetch available cars for the user
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/protected/get-cars', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars); // Set cars from the response
        } else {
          throw new Error('Failed to fetch cars');
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast({
          title: 'Error fetching cars',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchCars();
  }, [toast]);

  // Validate and register the carpool
  const handleCarRegistration = async () => {
    if (!newCar.from || !newCar.destination || !newCar.spots || !newCar.car_id || !newCar.departure_postcode || !newCar.departure_city) {
      toast({
        title: 'Error',
        description: 'Please fill in all the required fields.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true); // Start loading when registering carpool
    try {
      const response = await fetch('/api/carpool/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: 1, // Replace with actual user ID from context or auth
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
          title: 'Carpool created.',
          description: 'Your carpool was created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setNewCar({
          from: '',
          destination: '',
          spots: '',
          car_id: '',
          carpool_type: 'drop-off',
          departure_postcode: '',
          departure_city: '',
        }); // Reset the form after success
      } else {
        throw new Error('Failed to create carpool');
      }
    } catch (error) {
      console.error('Error registering car:', error);
      toast({
        title: 'Error',
        description: 'Failed to register carpool.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Stop loading when done
    }
  };

  return (
    <Box p={5}>
      <Heading as="h3" size="lg" mb={4}>
        Registrera Ny Carpool
      </Heading>

      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={4}>
          <Grid templateColumns={['1fr', '1fr 1fr']} gap={4} w="100%">
            <GridItem>
              <FormControl isRequired>
                <FormLabel>From</FormLabel>
                <Input
                  type="text"
                  placeholder="Departure Address"
                  value={newCar.from}
                  onChange={(e) => setNewCar({ ...newCar, from: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Destination</FormLabel>
                <Input
                  type="text"
                  placeholder="Destination"
                  value={newCar.destination}
                  onChange={(e) => setNewCar({ ...newCar, destination: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Departure Postcode</FormLabel>
                <Input
                  type="text"
                  placeholder="Postcode"
                  value={newCar.departure_postcode}
                  onChange={(e) => setNewCar({ ...newCar, departure_postcode: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Departure City</FormLabel>
                <Input
                  type="text"
                  placeholder="City"
                  value={newCar.departure_city}
                  onChange={(e) => setNewCar({ ...newCar, departure_city: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Available Seats</FormLabel>
                <NumberInput min={1} value={newCar.spots} onChange={(value) => setNewCar({ ...newCar, spots: value })}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl id="car_id">
                <FormLabel>Select Car</FormLabel>
                <Select
                  placeholder="Select a car"
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
                <FormLabel>Carpool Type</FormLabel>
                <Select
                  value={newCar.carpool_type}
                  onChange={(e) => setNewCar({ ...newCar, carpool_type: e.target.value })}
                >
                  <option value="drop-off">Drop Off</option>
                  <option value="pick-up">Pick Up</option>
                  <option value="both">Both</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
          <Button
            colorScheme="blue"
            onClick={handleCarRegistration}
            isLoading={loading}
            isDisabled={loading}
          >
            Register Carpool
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default CarpoolComponent;
