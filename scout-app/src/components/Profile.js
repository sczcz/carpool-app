import React, { useState, useEffect } from 'react';
import customTheme from '../Theme';
import { FaTrash } from "react-icons/fa"; // Import trash can icon from react-icons library
import {
  Box,
  Heading,
  Icon,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Divider,
  Select,
  HStack,
  Avatar,
  Flex,
  useColorModeValue,
  Stack,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useBreakpointValue,
} from '@chakra-ui/react';

const Profile = () => {
  // User information (auto-fill from backend)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Address information
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');

  // Children information
  const [children, setChildren] = useState([]);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childRole, setChildRole] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [childPhone, setChildPhone] = useState('');

  // Modal states
  const [isAddChildOpen, setAddChildOpen] = useState(false);
  const [isAddressInfoOpen, setAddressInfoOpen] = useState(false);
  const [isAddCarOpen, setAddCarOpen] = useState(false);

  // Car information
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Gas');
  const [consumption, setConsumption] = useState('');
  const [modelName, setModelName] = useState('');

  // Car information (this was missing in your code)
  const [cars, setCars] = useState([]);  // Now defined as state for cars

  const roleColors = {
    tumlare: 'blue.400',
    kutar: 'cyan.400',     
    upptäckare: 'green.400', 
    äventyrare: 'yellow.400', 
    utmanare: 'orange.400',   
    rover: 'purple.400',        
  };

  const fuelTypeColors = {
    Gas: 'yellow.400',
    Hybrid: 'orange.400',
    Electric: 'teal.400',
  };

    // Fetch user, children, and cars data
    const fetchCars = async () => {
      try {
        const response = await fetch('/api/protected/get-cars', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCars(data.cars);  // Set the fetched cars in state
        } else {
          console.error('Failed to fetch cars data');
        }
      } catch (error) {
        console.error('Error fetching cars data:', error);
      }
    };

  // Fetch logged-in user information on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/protected/user', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          // Set state with user information
          setFirstName(user.first_name);
          setLastName(user.last_name);
          setEmail(user.email);
          setRole(user.role);
          setAddress(user.address || '');
          setPostcode(user.postcode || '');
          setCity(user.city || '');
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/protected/get-children', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
    
          const mappedChildren = data.children.map(child => ({
            firstName: child.first_name,
            lastName: child.last_name,
            role: child.role, // Ensure this value is correct
            membershipNumber: child.membership_number,
            phone: child.phone
          }));
    
          setChildren(mappedChildren);  // Set state with the mapped children
        } else {
          console.error('Failed to fetch children data');
        }
      } catch (error) {
        console.error('Error fetching children data:', error);
      }
    };

    fetchUserData();
    fetchChildren();
    fetchCars();  // Fetch cars on mount
  }, []);
  

  const handleSaveAddress = async () => {
    try {
      const response = await fetch('/api/protected/add-user-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          address,
          postcode,
          city,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Address updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update address'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while updating the address');
    } 
    setAddressInfoOpen(false); // Close the modal after saving
  };

  const handleAddChild = async () => {
    if (childFirstName && childLastName && membershipNumber) {
      try {
        // Skicka POST-begäran till backend för att lägga till ett barn
        const response = await fetch('/api/protected/add-child', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Skicka med cookies för autentisering
          body: JSON.stringify({
            membership_number: membershipNumber,  // Nytt fält
            first_name: childFirstName,
            last_name: childLastName,
            phone: childPhone,  // Nytt fält för telefonnummer
            role: childRole,  // Skicka rollen från dropdown-menyn
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert('Barn tillagt framgångsrikt!');
          setAddChildOpen(false);
          
          // Lägg till barnet i listan efter att det framgångsrikt har lagts till i backend
          setChildren([...children, { firstName: childFirstName, lastName: childLastName, role: childRole, membershipNumber, phone: childPhone }]);
          setChildFirstName('');
          setChildLastName('');
          setChildRole('Kutar');
          setMembershipNumber('');  // Återställ medlemsnummerfältet
          setChildPhone('');  // Återställ telefonnummerfältet
        } else {
          const error = await response.json();
          alert(`Fel: ${error.message || 'Misslyckades att lägga till barn'}`);
        }
      } catch (error) {
        console.error('Fel vid tillägg av barn:', error);
        alert('Ett fel uppstod vid tillägg av barnet');
      }
    } else {
      alert('Du måste fylla i förnamn, efternamn och medlemsnummer för barnet');
    }
  };

  const handleRemoveChild = async (index) => {
    const childToRemove = children[index]; // Get the child to be deleted
  
    if (childToRemove && childToRemove.membershipNumber) {
      // Confirm before deleting
      if (window.confirm(`Are you sure you want to delete ${childToRemove.firstName} ${childToRemove.lastName}?`)) {
        // Call the delete API
        await deleteChild(childToRemove.membershipNumber);
  
        // After successful deletion, remove the child from state
        setChildren(children.filter((_, i) => i !== index));
      }
    } else {
      alert("Failed to identify child for deletion.");
    }
  };
  
  // Delete API function (already written)
  const deleteChild = async (membershipNumber) => {
    try {
      const response = await fetch('/api/protected/delete-child', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are included for authentication
        body: JSON.stringify({ membership_number: membershipNumber }) // Send the membership number
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${data.message}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to delete child'}`);
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('An error occurred while trying to delete the child.');
    }
  };
  

  const handleUpdateChild = (index, updatedRole) => {
    const updatedChildren = children.map((child, i) => {
      if (i === index) {
        return { ...child, role: updatedRole };
      }
      return child;
    });
    setChildren(updatedChildren);
  };

  const handleRemoveCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await fetch(`/api/protected/delete-car/${carId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          alert('Car deleted successfully!');
          fetchCars(); // Refresh car list after deletion
        } else {
          console.error('Failed to delete car');
        }
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  const handleAddCar = async () => {
    if (regNumber && fuelType && consumption && modelName) {
      try {
        const response = await fetch('/api/protected/add-car', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            reg_number: regNumber,
            fuel_type: fuelType,
            consumption: consumption,
            model_name: modelName,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          alert('Car added successfully!');

          fetchCars();

          // Close the modal after successful car addition
          setAddCarOpen(false);
  
          // Clear form fields after saving
          setRegNumber('');
          setFuelType('Gas');
          setConsumption('');
          setModelName('');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'Failed to add car'}`);
        }
      } catch (error) {
        console.error('Error adding car:', error);
        alert('An error occurred while adding the car');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
  <Box
        p={5}
        bg={useColorModeValue('gray.100', 'gray.800')}
        borderRadius="lg"
        boxShadow="lg"
        maxW="1000px"
        ml={[0, 50, 100, 225]} // Responsive margins
        mr={[0, 50, 100, 225]} // Responsive margins
        mb={50}
        mt={50}
      >      
    <Flex direction={['column', 'column', 'row']} align="center" mb={8}>
        <Avatar
          size="2xl"
          name={`${firstName} ${lastName}`}
          src="https://your-avatar-url.com/avatar.png" // Replace with your avatar URL
          bg="#043A63" // Background color when no image is provided
          color="white" // Text color for initials
        />
        <Stack spacing={1} ml={[0, 0, 4]} textAlign={['center', 'center', 'left']}>
          <Heading as="h2" size="lg" colorScheme="brand">
            {firstName} {lastName}
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {email}
          </Text>
          <Text fontSize="lg" color="gray.600">
            Adress: {address}, {postcode}, {city}
          </Text>
          <Text fontSize="md" color="gray.500">
            Roll: {role}
          </Text>
        </Stack>
      </Flex>

      {/* Children Section */}
      <VStack spacing={2} align="start" mt={[4, 4, 0]}>
        <Heading as="h4" size="md" mb={4} colorScheme="brand" >
        {firstName} {lastName} Barn: 
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} spacing={4} width="full">
          {children.map((child, index) => (
            <Box
            key={index}
            borderWidth="1px"
            borderTopRadius="lg" // Rounded top corners
            borderBottomLeftRadius="lg" // Rounded bottom left corner
            borderBottomRightRadius="lg" // Rounded bottom right corner
            overflow="hidden"
            boxShadow="lg"
            p={0}
            pb={4}
            bg="white" // Set background color to white
            transition="0.2s"
            >
            {/* Colored Top Box */}
            <Box
                bg={roleColors[child.role] || 'gray.200'} // Set the color for the top part of the card
                borderTopRadius="lg" // Ensure the top remains rounded
                p={4} // Adjust padding for the colored box for better fit
            >
                {/* You can also add content here if needed */}
            </Box>

            {/* Role in the White Box */}
            <Text
            fontSize={{ base: "md", sm: "lg" }} // Responsive font sizes
            fontWeight="bold" // Make the role text thicker
            color={roleColors[child.role] || 'gray.200'} // Set color based on role
            mt={2} // Margin top for spacing
            pl={4}
            >
            {child.role.charAt(0).toUpperCase() + child.role.slice(1).toLowerCase()}: {child.firstName}
            </Text>

            {/* Other Text in the White Box */}
            <Text 
                fontSize={{ base: "sm", sm: "md" }} // Responsive font sizes
                color="black" 
                mt={1} // Margin top for spacing
                noOfLines={2} // Limit lines to avoid overflow
                pl={4}
                pr={4}
            >
            Medlemsnummer: {child.membershipNumber} (Telefon: {child.phone})
            </Text>

            <HStack mt={2} justifyContent="space-between">
                <Select
                value={child.role}
                onChange={(e) => handleUpdateChild(index, e.target.value)}
                width={{ base: "100%", md: "150px" }} // Responsive width
                color="black" // Set text color for Select
                bg="white" // Optional: Set background color for better visibility
                pl={4}
                
                >
                <option value="kutar">Kutar</option>
                <option value="tumlare">Tumlare</option>
                <option value="upptäckare">Upptäckare</option>
                <option value="äventyrare">Äventyrare</option>
                <option value="utmanare">Utmanare</option>
                <option value="rover">Rover</option>
                </Select>
                <Button
                colorScheme="red"
                onClick={() => handleRemoveChild(index)}
                variant="outline" // Use outline variant if you want a border
                aria-label="Remove Child" // Accessibility label
                mr={4}
                >
                <Icon as={FaTrash} color="red.500" /> {/* Red color for the icon */}
                </Button>
            </HStack>
            </Box>
          ))}
        </SimpleGrid>
          {/* Render the cars below children */}
          <Heading as="h4" size="md" mt={6} colorScheme="brand">
          Bilar:
        </Heading>
        <SimpleGrid mt={3} columns={[1, 1, 2]} spacing={4} width="full">
          {cars.map((car, index) => (

            <Box
            key={index}
            borderWidth="1px"
            borderTopRadius="lg" // Rounded top corners
            borderBottomRadius="lg" // Rounded bottom corners
            overflow="hidden"
            boxShadow="lg"
            p={4}
            bg="white" // Background color of the card
            borderColor="gray.300" // Border color
            >
          {/* Colored Header for the Car Information */}
          <Box
                bg={fuelTypeColors[car.fuel_type] || 'gray.200'} // Set background color based on fuel type
                borderTopRadius="lg"
                p={3}
              >
                <Text fontSize="lg" fontWeight="bold" color="black">
                  {car.model_name} - {car.reg_number.toUpperCase()}
                </Text>
              </Box>

          {/* Main Content with Centered Text and Delete Button */}
          <HStack justifyContent="space-between" mt={3} alignItems="center"> {/* Align items center */}
            <Text
              fontSize={{ base: "sm", sm: "md" }} // Responsive font sizes
              color="black" // Text color
            >
              Fuel Type: {car.fuel_type}, Consumption: {car.consumption} l/kWh
            </Text>

            {/* Button Section */}
            <Button
              colorScheme="red"
              onClick={() => handleRemoveCar(car.car_id)}
              variant="outline" // Use outline variant if you want a border
              aria-label="Remove Car" // Accessibility label
            >
              <Icon as={FaTrash} color="red.500" /> {/* Red color for the icon */}
            </Button>
          </HStack>
        </Box>
          ))}
        </SimpleGrid>
      </VStack>

      <Divider mb={6} />

      {/* Buttons for Adding Child and Address Information */}
      <HStack spacing={4} align="start" mt={10} mb={50}>
        <Button colorScheme="brand" onClick={() => setAddChildOpen(true)}>
          Lägg till Barn
        </Button>
        <Button colorScheme="brand" onClick={() => setAddressInfoOpen(true)}>
          Adressinformation
        </Button>
        <Button colorScheme="brand" onClick={() => setAddCarOpen(true)}>
          Lägg till Bil
        </Button>
      </HStack>

      <Divider mb={3} />

      {/* Modal for Adding Child */}
      <Modal isOpen={isAddChildOpen} onClose={() => setAddChildOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lägg till Barn</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Förnamn</FormLabel>
              <Input
                value={childFirstName}
                onChange={(e) => setChildFirstName(e.target.value)}
                placeholder="Förnamn"
                isRequired // Accessibility enhancement
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Efternamn</FormLabel>
              <Input
                value={childLastName}
                onChange={(e) => setChildLastName(e.target.value)}
                placeholder="Efternamn"
                isRequired // Accessibility enhancement
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Roll</FormLabel>
              <Select
                value={childRole}
                onChange={(e) => setChildRole(e.target.value)}
              >
                <option value="kutar">Kutar</option>
                <option value="tumlare">Tumlare</option>
                <option value="upptäckare">Upptäckare</option>
                <option value="äventyrare">Äventyrare</option>
                <option value="utmanare">Utmanare</option>
                <option value="rover">Rover</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Medlemsnummer</FormLabel>
              <Input
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value)}
                placeholder="Skriv in medlemsnummer"
                isRequired // Accessibility enhancement
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Telefonnummer</FormLabel>
              <Input
                value={childPhone}
                onChange={(e) => setChildPhone(e.target.value)}
                placeholder="Skriv in telefonnummer"
                isRequired // Accessibility enhancement
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={handleAddChild}>
              Spara
            </Button>
            <Button ml={3} onClick={() => setAddChildOpen(false)}>
              Avbryt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Address Information */}
      <Modal isOpen={isAddressInfoOpen} onClose={() => setAddressInfoOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adressinformation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Adress</FormLabel>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Skriv in din adress"
                isRequired // Accessibility enhancement
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Postnummer</FormLabel>
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Skriv in postnummer"
                isRequired // Accessibility enhancement
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Stad</FormLabel>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Skriv in stad"
                isRequired // Accessibility enhancement
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={handleSaveAddress}>
              Spara
            </Button>
            <Button ml={3} onClick={() => setAddressInfoOpen(false)}>
              Avbryt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Adding Car */}
      <Modal isOpen={isAddCarOpen} onClose={() => setAddCarOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lägg till Bil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Registeringsnummer</FormLabel>
              <Input
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="Skriv in registreringsnummer"
                isRequired
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Bränsletyp</FormLabel>
              <Select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                isRequired
              >
                <option value="Electric">Electric</option>
                <option value="Gas">Gas</option>
                <option value="Hybrid">Hybrid</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Konsumption (L or kWh)</FormLabel>
              <Input
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                placeholder="Ange bränslekonsumption"
                type="number"
                step="0.1"
                isRequired
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Model Name</FormLabel>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Ange bilmodell"
                isRequired
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddCar}>
              Lägg till bil
            </Button>
            <Button ml={3} onClick={() => setAddCarOpen(false)}>
              Avbryt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
