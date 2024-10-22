import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Flex,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FaCar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const CarpoolComponent = () => {
  const { activityId } = useParams(); // Get the activity_id from the URL
  const [carpoolingOptions, setCarpoolingOptions] = useState([]);
  const [showCarForm, setShowCarForm] = useState(false);
  const [newCar, setNewCar] = useState({
    from: '',
    to: '',
    spots: '',
    departure_postcode: '',
    departure_city: '',
    car_id: '',
    carpool_type: 'drop-off',
  });
  const [cars, setCars] = useState([]); // List of cars for selection
  const toast = useToast();

  // Fetch cars from the backend when the component mounts
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/user/cars', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
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

    fetchCars(); // Call the fetchCars function
  }, [toast]);

  // Fetch carpooling options from the backend
  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
          method: 'GET',
          credentials: 'include', // include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
          setCarpoolingOptions(data.carpools); // Populate with fetched carpool data
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
      }
    };

    fetchCarpools();
  }, [activityId, toast]);

  // Handle joining or leaving a carpool
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

  // Handle carpool registration
  const handleCarRegistration = async () => {
    try {
      const response = await fetch('/api/carpool/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: 1, // Replace with actual user ID
          car_id: newCar.car_id, // Selected car ID
          activity_id: activityId, // activity_id from the URL
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
        setNewCar({
          from: '',
          to: '',
          spots: '',
          car_id: '',
          carpool_type: '',
          departure_postcode: '',
          departure_city: '',
        });
        setShowCarForm(false);
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
    }
  };

  return (
    <Box p={5}>
      <Divider mb={6} />

      {/* Carpooling Section */}
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Available Carpools
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
                    {option.departure_address} - {option.departure_city} ({option.carpool_type})
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
          ))}
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* Button to Show/Hide Form for Registering a Carpool */}
      <Box mb={8}>
        <Button colorScheme="brand" onClick={() => setShowCarForm(!showCarForm)}>
          {showCarForm ? 'Hide' : 'Register a Carpool'}
        </Button>
        <Collapse in={showCarForm} animateOpacity>
          <Box mt={4}>
            <Heading as="h2" size="md" mb={4} color="brand.500">
              Register a New Carpool
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl id="from">
                <FormLabel>From (Departure Address)</FormLabel>
                <Input
                  placeholder="Starting point"
                  value={newCar.from}
                  onChange={(e) => setNewCar({ ...newCar, from: e.target.value })}
                />
              </FormControl>
              <FormControl id="departure_postcode">
                <FormLabel>Departure Postcode</FormLabel>
                <Input
                  placeholder="Postcode"
                  value={newCar.departure_postcode}
                  onChange={(e) => setNewCar({ ...newCar, departure_postcode: e.target.value })}
                />
              </FormControl>
              <FormControl id="departure_city">
                <FormLabel>Departure City</FormLabel>
                <Input
                  placeholder="City"
                  value={newCar.departure_city}
                  onChange={(e) => setNewCar({ ...newCar, departure_city: e.target.value })}
                />
              </FormControl>
              <FormControl id="to">
                <FormLabel>Destination</FormLabel>
                <Input
                  placeholder="Destination"
                  value={newCar.to}
                  onChange={(e) => setNewCar({ ...newCar, to: e.target.value })}
                />
              </FormControl>
              <FormControl id="spots">
                <FormLabel>Seats</FormLabel>
                <NumberInput min={1} value={newCar.spots} onChange={(value) => setNewCar({ ...newCar, spots: value })}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
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
              <FormControl id="carpool_type">
                <FormLabel>Carpool Type</FormLabel>
                <Select value={newCar.carpool_type} onChange={(e) => setNewCar({ ...newCar, carpool_type: e.target.value })}>
                  <option value="drop-off">Drop-off</option>
                  <option value="pick-up">Pick-up</option>
                  <option value="both">Both</option>
                </Select>
              </FormControl>
              <Button colorScheme="brand" onClick={handleCarRegistration}>
                Register Carpool
              </Button>
            </VStack>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CarpoolComponent;
