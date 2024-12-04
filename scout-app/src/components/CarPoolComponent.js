import React, { useState, useEffect, useRef } from 'react';
import { InfoIcon } from '@chakra-ui/icons';
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
  useBreakpointValue,
  IconButton,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody
} from '@chakra-ui/react';
import AddCarModal from './AddCarModal'; // Import AddCarModal


const CarpoolComponent = ({ activityId, onClose, activity, onCarpoolCreated }) => {
  const [newCar, setNewCar] = useState({
    from: '',
    destination: activity?.location || 'Plats saknas', // Lägg till "?" för att kontrollera om activity är null eller undefined
    spots: '',
    departure_postcode: '',
    departure_city: '',
    car_id: '',
    carpool_type: 'drop-off',
  });
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const toastShown = useRef(false); // Track if the toast has been shown

  const gridTemplateColumns = useBreakpointValue({ base: '1fr', md: '1fr 1fr' });

  useEffect(() => {
    if (activity) {
      setNewCar((prevCar) => ({ ...prevCar, destination: activity.location }));
    }
  }, [activity]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/protected/get-cars', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars);

          // Only show toast if no cars are available and it hasn't been shown yet
          if (data.cars.length === 0 && !toastShown.current) {
            setIsAddCarModalOpen(true); // Open AddCarModal if no cars are available
            toast({
              title: 'Ingen bil registrerad',
              description: "Du måste lägga till en bil för att registrera en samåkning",
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            toastShown.current = true; // Set the ref to true so toast is not shown again
          }
        } else {
          throw new Error('Kunde inte hämta bilar');
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
  }, []);

  const handleCarAdded = (newCar) => {
    setCars((prevCars) => [...prevCars, newCar]);
    setIsAddCarModalOpen(false); // Close the modal after adding a car
  
    // Refetch cars to update the list
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/protected/get-cars', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars);
        }
      } catch (error) {
        console.error('Fel vid hämtning av bilar:', error);
      }
    };
  
    fetchCars();
  };
  

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

    setLoading(true);
    try {
      const response = await fetch('/api/carpool/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: 1,
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
          title: 'Samåkning skapad',
          description: 'Din samåkning har skapats.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onCarpoolCreated();
        onClose();
      } else {
        throw new Error('Kunde inte skapa samåkning');
      }
    } catch (error) {
      console.error('Fel vid registrering av samåkning:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte registrera samåkning.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={{ base: 2, md: 5 }}>
      <Box mb={8} display="flex" alignItems="center">
        <Heading as="h3" size="lg" >
          Registrera ny samåkning
        </Heading>
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={<InfoIcon />}
                aria-label="More Info"
                variant="unstyled"
                fontSize={{ base: 'lg', md: 'xl', lg: 'xl' }}
                color="gray.500"
                ml={2}
                _hover={{ color: "gray.700", cursor: 'pointer' }} // Apply hover effect
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <Text mb={2}>
                Här kan du registrera en samåkning för att hjälpa andra och minska miljöpåverkan. 
                </Text>
                <Text mb={2}>
                När du registrerar en samåkning, kan andra föräldrar se tillgängliga platser i din bil och boka sig för att åka med dig till aktiviteter.                </Text>
                <Text>
                Det är ett enkelt sätt att göra aktiviteter mer hållbara och minska trafiken.
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
      </Box>


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
                  placeholder="Avgångsadress"
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
                  value={activity.location || 'Plats saknas'}
                  isReadOnly
                  borderColor="gray.200"
                  _readOnly={{ opacity: 1, cursor: "not-allowed" }}
                />
              </FormControl>
            </GridItem>




            <GridItem>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Postnummer för avgång</FormLabel>
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Avgångsstad</FormLabel>
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Tillgängliga platser</FormLabel>
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
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Riktning</FormLabel>
                <Select
                  size="sm"
                  value={newCar.carpool_type}
                  onChange={(e) => setNewCar({ ...newCar, carpool_type: e.target.value })}
                >
                  <option value="drop-off">Avresa</option>
                  <option value="pick-up">Hemresa</option>
                  <option value="both">Avresa och Hemresa</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
          <Button
            colorScheme="brand"
            onClick={handleCarRegistration}
            isLoading={loading}
            isDisabled={loading}
            size="sm"
            w="100%"
          >
            Registrera samåkning
          </Button>
        </VStack>
        
      )}
            {/* AddCarModal */}
            <AddCarModal
        isOpen={isAddCarModalOpen}
        onClose={() => setIsAddCarModalOpen(false)}
        onCarAdded={handleCarAdded} // Pass the callback function
      />
    </Box>
  );
};

export default CarpoolComponent;
