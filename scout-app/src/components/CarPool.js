
import React, { useEffect, useState } from 'react';
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
  Divider,
  Flex,
} from '@chakra-ui/react';
import { FaCar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const CarpoolComponent = () => {
  const { activityId } = useParams(); // Get the activity_id from the URL
  const [carpoolingOptions, setCarpoolingOptions] = useState([]);
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
  const [fetching, setFetching] = useState(false); // Loading state for fetching carpools
  const toast = useToast();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/user/cars', {
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

    const fetchCarpools = async () => {
      setFetching(true); // Start fetching state
      try {
        const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCarpoolingOptions(data.carpools); // Update carpools
        } else {
          throw new Error('Failed to fetch carpools');
        }
      } catch (error) {
        console.error('Error fetching carpool data:', error);
        toast({
          title: 'Error fetching carpools.',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setFetching(false); // End fetching state
      }
    };

    // Fetch data when the component mounts
    setLoading(true);
    Promise.all([fetchCars(), fetchCarpools()]).finally(() => setLoading(false));
  }, [activityId, toast]);

  // Validate form data before submitting
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
        const newCarpool = await response.json();
        setCarpoolingOptions([...carpoolingOptions, newCarpool]);
        // Reset the form
        setNewCar({
          from: '',
          destination: '',
          spots: '',
          car_id: '',
          carpool_type: 'drop-off',
          departure_postcode: '',
          departure_city: '',
        });
        toast({
          title: 'Carpool created.',
          description: 'Your carpool was created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
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

  const handleJoinCarpool = async (id, joined) => {
    try {
      const endpoint = joined ? '/api/carpool/leave' : '/api/carpool/join';
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carpool_id: id }),
      });

      if (response.ok) {
        // Optimistically update the UI
        setCarpoolingOptions(carpoolingOptions.map((option) =>
          option.id === id
            ? { ...option, available_seats: option.available_seats + (joined ? 1 : -1), joined: !joined }
            : option
        ));
        toast({
          title: `Successfully ${joined ? 'left' : 'joined'} carpool.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to join/leave carpool');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update carpool status.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Register a New Carpool
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
                  <FormLabel>To</FormLabel>
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
                    <option value="both">both</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
            <Button
              colorScheme="brand"
              onClick={handleCarRegistration}
              isLoading={loading}
              isDisabled={loading}
            >
              Register Carpool
            </Button>
          </VStack>
        )}
      </Box>

      <Divider my={8} />

      <Box>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Available Carpools
        </Heading>
        {fetching ? (
          <Spinner />
        ) : (
          carpoolingOptions.map((option) => (
            <Box
              key={option.id} // Use unique key
              p={4}
              borderWidth={1}
              borderRadius="lg"
              w="100%"
              bg="gray.50"
              boxShadow="sm"
              mb={4}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="md" color="brand.600">
                    {option.departure_address} - {option.destination} , ({option.carpool_type})
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Available Seats: {option.available_seats}
                  </Text>
                </Box>
                <Button
                  leftIcon={<FaCar />}
                  colorScheme="brand"
                  size="sm"
                  disabled={option.available_seats === 0 && !option.joined}
                  onClick={() => handleJoinCarpool(option.id, option.joined)}
                >
                  {option.joined ? 'Leave' : 'Join'}
                </Button>
              </Flex>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default CarpoolComponent;