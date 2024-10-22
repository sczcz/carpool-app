import React, { useState, useEffect } from 'react';
import customTheme from '../Theme';
import {
  Box,
  Heading,
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

  const roleColors = {
    tumlare: 'blue.400',
    kutar: 'cyan.400',     
    upptäckare: 'green.400', 
    äventyrare: 'yellow.400', 
    utmanare: 'orange.400',   
    rover: 'purple.400',        
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

    fetchUserData();
    fetchChildren();
  }, []);

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
    if (!membershipNumber) {
      alert('Du måste fylla i medlemsnummer för barnet');
      return;
    }
  
    // Check if the user is creating a new child (all fields filled)
    const isNewChild = childFirstName && childLastName && childRole;
  
    try {
      const response = await fetch('/api/protected/add-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          membership_number: membershipNumber,
          first_name: isNewChild ? childFirstName : '', // Send empty if not creating a new child
          last_name: isNewChild ? childLastName : '',
          phone: childPhone || '',  // Optional field
          role: isNewChild ? childRole : '',  // Role is required for a new child
        }),
      });
  
      if (response.ok) {
        alert('Barn tillagt framgångsrikt!');
        setAddChildOpen(false);
  
        // Refetch the children from the backend after successful addition
        await fetchChildren(); // Call the function that fetches children
  
        // Reset the form fields
        setChildFirstName('');
        setChildLastName('');
        setChildRole('Kutar');
        setMembershipNumber(''); // Reset the membership number field
        setChildPhone(''); // Reset the phone number field
      } else {
        const error = await response.json();
        alert(`Fel: ${error.message || 'Misslyckades att lägga till barn'}`);
      }
    } catch (error) {
      console.error('Fel vid tillägg av barn:', error);
      alert('Ett fel uppstod vid tillägg av barnet');
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

  return (
  <Box
        p={5}
        bg={useColorModeValue('gray.100', 'gray.800')}
        borderRadius="lg"
        boxShadow="lg"
        maxW="1000px"
        ml={[0, 50, 100, 225]} // Responsive margins
        mr={[0, 50, 100]} // Responsive margins
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
        <Heading as="h4" size="md" mb={10} colorScheme="brand" >
        {firstName} {lastName} Barn: 
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} spacing={4} width="full">
          {children.map((child, index) => (
            <Box
              key={index}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              p={4}
              bg={roleColors[child.role] || 'gray.200'} // Set background color based on role
              transition="0.2s"
              _hover={{ boxShadow: 'xl', transform: 'scale(1.02)' }} // Card hover effect
            >
              <Text fontSize="lg" color="white"> {/* Change text color to white */}
                {child.firstName} {child.lastName} - {child.role} (Medlemsnummer: {child.membershipNumber}) (Telefon: {child.phone})
              </Text>
              <HStack mt={2} justifyContent="space-between">
                <Select
                  value={child.role}
                  onChange={(e) => handleUpdateChild(index, e.target.value)}
                  width="150px"
                  color="black" // Set text color for Select
                  bg="white" // Optional: Set background color for better visibility
                >
                  <option value="kutar">Kutar</option>
                  <option value="tumlare">Tumlare</option>
                  <option value="upptäckare">Upptäckare</option>
                  <option value="äventyrare">Äventyrare</option>
                  <option value="utmanare">Utmanare</option>
                  <option value="rover">Rover</option>
                </Select>
                <Button colorScheme="red" onClick={() => handleRemoveChild(index)} color="white">
                  Ta bort
                </Button>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      <Divider mb={6} />

      {/* Buttons for Adding Child and Address Information */}
      <HStack spacing={4} align="start" mt={20} mb={50}>
        <Button colorScheme="brand" onClick={() => setAddChildOpen(true)}>
          Lägg till Barn
        </Button>
        <Button colorScheme="brand" onClick={() => setAddressInfoOpen(true)}>
          Adressinformation
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
    </Box>
  );
};

export default Profile;