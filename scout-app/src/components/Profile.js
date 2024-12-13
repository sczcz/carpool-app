import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPen, FaPlus } from "react-icons/fa";
import AddChildModal from './AddChildModal';
import AddCarModal from './AddCarModal';
import { useUser } from '../utils/UserContext';
import {
  Box,
  Heading,
  Icon,
  useDisclosure,
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
  useToast,
  Stack,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spacer,
  Center,
} from '@chakra-ui/react';

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    fullName,
    roles,
    email: contextEmail,
    address: contextAddress,
    postcode: contextPostcode,
    city: contextCity,
    phone: contextPhone,
    fetchUserData,
    updateUserData,
    isInitialized,
    userId,
    loading
  } = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // Children information
  const [children, setChildren] = useState([]);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childRole, setChildRole] = useState('kutar');
  const [childPhone, setChildPhone] = useState('');

  const { onClose } = useDisclosure();  // Hook to control the drawer

  // Modal states
  const [isAddChildOpen, setAddChildOpen] = useState(false);
  const [isAddressInfoOpen, setNewInfoOpen] = useState(false);
  const [isAddCarOpen, setAddCarOpen] = useState(false);

  // Car information
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Gas');
  const [consumption, setConsumption] = useState('');
  const [modelName, setModelName] = useState('');

  // Car information (this was missing in your code)
  const [cars, setCars] = useState([]);  // Now defined as state for cars


  const { clearUserData } = useUser(); // Hämta roll och inloggningsstatus


  const handleChildAdded = (newChild) => {
    setChildren((prevChildren) => [...prevChildren, newChild]);
  };

  const roleColors = {
    tumlare: '#41a62a',
    kutar: '#71c657',
    upptäckare: '#00a8e1',
    äventyrare: '#e95f13',
    utmanare: '#da005e',
    rover: '#e2e000',
  };

  const fuelTypeColors = {
    Gas: 'yellow.400',
    Diesel: 'red.800',
    Hybrid: 'orange.400',
    Electric: 'teal.400',
  };

    useEffect(() => {
      if (!loading && !userId) {
        window.location.href = '/';
      }
    }, [loading, userId]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'  // Include cookies in the request
      });

      if (response.ok) {
        clearUserData();
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/protected/get-children', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setChildren(data.children.map(child => ({
          childId: child.child_id,
          firstName: child.first_name,
          lastName: child.last_name,
          role: child.role,
          phone: child.phone,
        })));
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

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
      console.error('Error fetching cars:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isInitialized) {
        await fetchUserData();
      }

      if (userId && isInitialized) {
        await Promise.all([fetchChildren(), fetchCars()]);
      }
    };

    fetchData();
  }, [isInitialized, userId, fetchUserData]);

  useEffect(() => {
    if (fullName) {
      const [fName, lName] = fullName.split(' ');
      setFirstName(fName || '');
      setLastName(lName || '');
    }
    setEmail(contextEmail || '');
    setAddress(contextAddress || '');
    setPostcode(contextPostcode || '');
    setCity(contextCity || '');
    setPhone(contextPhone || '');
  }, [fullName, contextAddress, contextPostcode, contextCity, contextPhone]);


  // Handle new car addition
  const handleCarAdded = async (newCar) => {
    try {
      setCars((prevCars) => [...prevCars, newCar]);

      await fetchCars();
    } catch (error) {
      console.error("Error updating car list:", error);
    }
  };

  const handleSaveNewInfo = async () => {
    try {
      const response = await fetch('/api/protected/edit-user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, postcode, city, phone, first_name: firstName, last_name: lastName, email: email }),
      });

      if (response.ok) {
        updateUserData({ address, postcode, city, phone, firstName, lastName, email }); // Uppdatera kontexten
        toast({
          title: 'Profilen har uppdaterats framgångsrikt!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Fel vid uppdatering',
          description: 'Misslyckades med att uppdatera profilen',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Ett fel uppstod',
        description: 'Kontakta support om problemet kvarstår.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setNewInfoOpen(false);
  };

  const handleAddChild = async () => {
    if (childFirstName && childLastName && childRole) {
      try {
        // Skicka POST-begäran till backend för att lägga till ett barn
        const response = await fetch('/api/protected/add-child', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Skicka med cookies för autentisering
          body: JSON.stringify({
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
          setChildren([...children, { childId: data.child_id, firstName: childFirstName, lastName: childLastName, role: childRole, phone: childPhone }]);
          setChildFirstName('');
          setChildLastName('');
          setChildRole('kutar');
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
      alert('Du måste fylla i förnamn, efternamn och roll för barnet');
    }
  };

  const handleSaveRole = async (index) => {
    const child = children[index];
    try {
      const response = await fetch('/api/protected/update-child-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          child_id: child.childId,
          new_role: child.role,
        }),
      });

      if (response.ok) {
        setChildren(prevChildren =>
          prevChildren.map((c, i) =>
            i === index ? { ...c, originalRole: c.role } : c
          )
        );
        toast({
          title: 'Barnets roll uppdaterad!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Fel',
          description: error.message || 'Misslyckades med att uppdatera roll',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating child role:', error);
      toast({
        title: 'Error',
        description: 'Ett fel uppstod vid uppdatering av roll',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveChild = async (index) => {
    const childToRemove = children[index]; // Get the child to be deleted

    if (childToRemove && childToRemove.childId) {
      // Confirm before deleting
      if (window.confirm(`Är du säker på att du vill ta bort ${childToRemove.firstName} ${childToRemove.lastName}?`)) {
        // Call the delete API
        await deleteChild(childToRemove.childId);

        // After successful deletion, remove the child from state
        setChildren(children.filter((_, i) => i !== index));
      }
    } else {
      alert("Det gick inte att identifiera barnet för borttagning.");
    }
  };

  // Delete API function (already written)
  const deleteChild = async (childId) => {
    try {
      const response = await fetch('/api/protected/delete-child', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are included for authentication
        body: JSON.stringify({ child_id: childId }) // Send the child ID
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Lyckades: ${data.message}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Det gick inte att ta bort barnet'}`);
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Ett fel inträffade vid försök att ta bort barnet.');
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
    toast({
      title: "Bekräfta borttagning",
      description: "Är du säker på att du vill ta bort den här bilen?",
      status: "warning",
      position: "top",
      duration: null,
      render: ({ onClose }) => (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
          color="black"
          maxWidth="sm"
          mx="auto"
        >
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              Är du säker på att du vill ta bort bilen?
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                size="sm"
                colorScheme="red"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/protected/delete-car/${carId}`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    if (response.ok) {
                      toast({
                        title: "Borttagning lyckades",
                        description: "Bilen har tagits bort.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "top",
                      });
                      fetchCars();
                    } else {
                      toast({
                        title: "Fel vid borttagning",
                        description: "Misslyckades med att ta bort bilen.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "top",
                      });
                    }
                  } catch (error) {
                    console.error("Fel vid borttagning av bil:", error);
                    toast({
                      title: "Ett fel inträffade",
                      description: "Det gick inte att ta bort bilen.",
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                      position: "top",
                    });
                  } finally {
                    onClose();
                  }
                }}
              >
                Ja, ta bort
              </Button>
              <Button size="sm" onClick={onClose}>
                Avbryt
              </Button>
            </HStack>
          </VStack>
        </Box>
      ),
    });
  };

  const handleRoleChange = (index, newRole) => {
    setChildren(prevChildren =>
      prevChildren.map((child, i) =>
        i === index ? { ...child, role: newRole } : child
      )
    );
  };

  const roleList = roles.join(', ');

  return (
    <Box
      p={5}
      borderRadius="lg"
      boxShadow="lg"
      maxW="1200px"
      mx="auto"
      mb={50}
      mt={50}
    >
      <Flex direction={['column', 'column', 'row']} align="center" justify="space-between" mb={8}>
        {/* User Information */}
        <Flex align="center">
          <Avatar
            size="2xl"
            name={fullName}
            src="https://your-avatar-url.com/avatar.png" // Replace with your avatar URL
            bg="#043A63" // Background color when no image is provided
            color="white" // Text color for initials
            mr={[6, 6, 0]} // Add margin-right for smaller screens (4) and remove it for larger screens (0)
            display={{ base: 'none', md: 'flex' }} // Hide on mobile, show on tablet and larger screens

          />
          <Stack spacing={1} ml={[0, 0, 4]} textAlign={['center', 'center', 'left']}>
            <Heading as="h2" size="lg" colorScheme="brand">
              {firstName} {lastName}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {email}
            </Text>
            <Text fontSize="lg" color="gray.600">
              Adress: {address || 'Saknas'}, {postcode || 'Saknas'}, {city || 'Saknas'}
            </Text>
            <Text fontSize="lg" color="gray.600">
              Telefon: {phone || 'Saknas'}
            </Text>
            <Text fontSize="md" color="gray.500">
              Roller: {roleList || 'Inga roller'}
            </Text>
          </Stack>
        </Flex>

      {/* Buttons */}
      <Stack
  fontSize={{ base: 'sm', lg: 'md' }} // Smaller text on mobile, medium on large screens
  spacing={{ base: 2, lg: 4 }} // Smaller spacing on mobile, larger spacing on desktop
  mt={[4, 4, -2]} // Negative margin to move buttons up
  alignSelf="center" // Align buttons at the top of the user info
  direction={{ base: 'column', lg: 'row' }} 
  pr={{ base: 0, md: 20 , lg: '0' }} // Add padding-right 10 on tablet (md) and larger
>
<Button
   rightIcon={<FaPen />}
    colorScheme="brand"
    variant="link" // No background
    onClick={() => setNewInfoOpen(true)}
    _hover={{ textDecoration: 'underline' }} // Underline on hover
    color="brand.500" // Set text color to brand.500
  >
    Redigera profil
  </Button>
  <Button
    rightIcon={<FaPlus />}
    colorScheme="brand"
    variant="link" // No background
    onClick={() => setAddChildOpen(true)}
    _hover={{ textDecoration: 'underline' }} // Underline on hover
    color="brand.500" // Set text color to brand.500
  >
    Lägg till barn
  </Button>
  <Button
    rightIcon={<FaPlus />}
    colorScheme="brand"
    variant="link" // No background
    onClick={() => setAddCarOpen(true)}
    _hover={{ textDecoration: 'underline' }} // Underline on hover
    color="brand.500" // Set text color to brand.500
  >
    Lägg till bil
  </Button>
  <Button 
    pr={ {base: '6', lg: '0'} }
    colorScheme='red'
    _hover={{ textDecoration: 'underline' }} // Underline on hover
    color='red'
    variant="ghost" 
    onClick={() => { handleLogout(); onClose(); }}>                  
    Logga ut
  </Button>
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
                (Telefon: {child.phone || 'N/A'})
              </Text>

              <HStack mt={2} spacing={2} alignItems="center" width="full">
                <Select
                  value={child.role}
                  onChange={(e) => handleRoleChange(index, e.target.value)}
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

                {/* Placera Spara-knappen nära rullmenyn */}
                {child.role !== child.originalRole && (
                  <Box>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleSaveRole(index)}
                    >
                      Spara
                    </Button>
                  </Box>
                )}

                {/* Använd Spacer för att skjuta soptunneikonen längst till höger */}
                <Spacer />

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
            car ? ( // Check if car is not undefined
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
                  bg={fuelTypeColors[car.fuel_type] || 'gray.200'} // Use default color if fuel_type is missing
                  borderTopRadius="lg"
                  p={3}
                >
                  <Text fontSize="lg" fontWeight="bold" color="black">
                    {car.model_name || 'Unknown Model'} - {car.reg_number ? car.reg_number.toUpperCase() : 'Unknown Reg'}
                  </Text>
                </Box>

                {/* Main Content with Centered Text and Delete Button */}
                <HStack justifyContent="space-between" mt={3} alignItems="center">
                  <Text
                    fontSize={{ base: "sm", sm: "md" }}
                    color="black"
                  >
                    Fuel Type: {car.fuel_type || 'Unknown'}
                  </Text>

                  {/* Button Section */}
                  <Button
                    colorScheme="red"
                    onClick={() => handleRemoveCar(car.car_id)}
                    variant="outline"
                    aria-label="Remove Car"
                  >
                    <Icon as={FaTrash} color="red.500" />
                  </Button>
                </HStack>
              </Box>
            ) : null // Skip rendering if car is undefined
          ))}
        </SimpleGrid>
      </VStack>

      <Divider mb={6} />

      {/* AddChildModal */}
      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setAddChildOpen(false)}
        onChildAdded={handleChildAdded}
      />

      <Modal isOpen={isAddressInfoOpen} onClose={() => setNewInfoOpen(false)}>
        <ModalOverlay />
        <ModalContent
          maxW={{ base: '90%', sm: '500px', lg: '800px' }} // Responsive width
          p={4} // Add padding for better spacing
        >
          <ModalHeader fontSize={{ base: 'lg', lg: '2xl' }}>Redigera profil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Flex container for splitting content */}
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              gap={8}
              justifyContent="space-between"
            >
              {/* Left side: Name, Last Name, and Phone */}
              <Box flex="1">
                <FormControl>
                  <FormLabel>E-post</FormLabel>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Skriv in din nya e-postadress"
                    type="email"
                    isRequired // Krav för att undvika tomt fält
                  />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel>Namn</FormLabel>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Skriv in förnamn"
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Efternamn</FormLabel>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Skriv in efternamn"
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Telefon</FormLabel>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Skriv in telefonnummer"
                  />
                </FormControl>
              </Box>

              {/* Right side: Address Information */}
              <Box flex="1">
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
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={handleSaveNewInfo}>
              Spara
            </Button>
            <Button ml={3} onClick={() => setNewInfoOpen(false)}>
              Avbryt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* AddCarModal */}
      <AddCarModal
        isOpen={isAddCarOpen}
        onClose={() => setAddCarOpen(false)}
        onCarAdded={handleCarAdded}
      />
    </Box>
  );
};

export default Profile;
