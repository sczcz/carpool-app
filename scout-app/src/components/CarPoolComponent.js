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
  const [cars, setCars] = useState([]); // List of cars for selection
  const [loading, setLoading] = useState(false); // Loading state for registration
  const toast = useToast();

  // Responsive grid columns: 1fr on small screens, 1fr 1fr on larger screens
  const gridTemplateColumns = useBreakpointValue({ base: '1fr', md: '1fr 1fr' });

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
        // Reset the form after success
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
    <Box p={{ base: 2, md: 5 }}>
      <Heading as="h3" size="lg" mb={4}>
        Registrera Ny Carpool
      </Heading>

      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={4}>
          <Grid templateColumns={gridTemplateColumns} gap={4} w="100%">
            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>From</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Departure Address"
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Departure Postcode</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="Postcode"
                  value={newCar.departure_postcode}
                  onChange={(e) => setNewCar({ ...newCar, departure_postcode: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Departure City</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  placeholder="City"
                  value={newCar.departure_city}
                  onChange={(e) => setNewCar({ ...newCar, departure_city: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Available Seats</FormLabel>
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Select Car</FormLabel>
                <Select
                  size="sm"
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Carpool Type</FormLabel>
                <Select
                  size="sm"
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
            size="sm" // Smaller button for compact view
            w="100%"  // Button stretches to 100% of the container on mobile
          >
            Register Carpool
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default CarpoolComponent;
