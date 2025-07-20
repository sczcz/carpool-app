import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPen, FaPlus } from "react-icons/fa";
import AddChildModal from './AddChildModal';
import AddCarModal from './AddCarModal';
import { useUser } from '../utils/UserContext';
import {
  Box,
  Checkbox,
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
    notificationPreferences: contextNotificationPreferences,
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
  const [notificationPreferences, setNotificationPreferences] = useState({});
  const [children, setChildren] = useState([]);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childRole, setChildRole] = useState('kutar');
  const [childPhone, setChildPhone] = useState('');

  const { onClose } = useDisclosure();

  const [isAddChildOpen, setAddChildOpen] = useState(false);
  const [isAddressInfoOpen, setNewInfoOpen] = useState(false);
  const [isAddCarOpen, setAddCarOpen] = useState(false);

  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Gas');
  const [consumption, setConsumption] = useState('');
  const [modelName, setModelName] = useState('');

  const [cars, setCars] = useState([]);


  const { clearUserData } = useUser();


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
        credentials: 'include'
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
    setNotificationPreferences(contextNotificationPreferences || {});
  }, [fullName, contextAddress, contextPostcode, contextCity, contextPhone, contextNotificationPreferences]);

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
        body: JSON.stringify({ 
          address, 
          postcode, 
          city, 
          phone, 
          first_name: firstName, 
          last_name: lastName, 
          email: email,
          notification_preferences: notificationPreferences,
         }),
      });

      if (response.ok) {
        updateUserData({ 
          address, 
          postcode, 
          city, 
          phone, 
          firstName, 
          lastName, 
          email,
          notificationPreferences, 
        });
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
        const response = await fetch('/api/protected/add-child', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            first_name: childFirstName,
            last_name: childLastName,
            phone: childPhone,
            role: childRole,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert('Barn tillagt framgångsrikt!');
          setAddChildOpen(false);

          setChildren([...children, { childId: data.child_id, firstName: childFirstName, lastName: childLastName, role: childRole, phone: childPhone }]);
          setChildFirstName('');
          setChildLastName('');
          setChildRole('kutar');
          setChildPhone('');
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
    const childToRemove = children[index];

    if (childToRemove && childToRemove.childId) {
      if (window.confirm(`Är du säker på att du vill ta bort ${childToRemove.firstName} ${childToRemove.lastName}?`)) {
        await deleteChild(childToRemove.childId);

        setChildren(children.filter((_, i) => i !== index));
      }
    } else {
      alert("Det gick inte att identifiera barnet för borttagning.");
    }
  };

  const deleteChild = async (childId) => {
    try {
      const response = await fetch('/api/protected/delete-child', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ child_id: childId })
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

  const handleNotificationChange = (key, value) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
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
            src="https://your-avatar-url.com/avatar.png"
            bg="#043A63"
            color="white"
            mr={[6, 6, 0]}
            display={{ base: 'none', md: 'flex' }}

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

        {/* Buttons below here */}
        <Stack
          fontSize={{ base: 'sm', lg: 'md' }}
          spacing={{ base: 2, lg: 4 }}
          mt={[4, 4, -2]}
          alignSelf="center"
          direction={{ base: 'column', lg: 'row' }} 
          pr={{ base: 0, md: 20 , lg: '0' }}
        >
          <Button
            rightIcon={<FaPen />}
              colorScheme="brand"
              variant="link"
              onClick={() => setNewInfoOpen(true)}
              _hover={{ textDecoration: 'underline' }}
              color="brand.500"
            >
            Redigera profil
          </Button>
          <Button
            rightIcon={<FaPlus />}
            colorScheme="brand"
            variant="link"
            onClick={() => setAddChildOpen(true)}
            _hover={{ textDecoration: 'underline' }}
            color="brand.500"
          >
            Lägg till barn
          </Button>
          <Button
            rightIcon={<FaPlus />}
            colorScheme="brand"
            variant="link"
            onClick={() => setAddCarOpen(true)}
            _hover={{ textDecoration: 'underline' }}
            color="brand.500"
          >
            Lägg till bil
          </Button>
          <Button 
            pr={ {base: '6', lg: '0'} }
            colorScheme='red'
            _hover={{ textDecoration: 'underline' }}
            color='red'
            variant="ghost" 
            onClick={() => { handleLogout(); onClose(); }}>                  
            Logga ut
          </Button>
        </Stack>
      </Flex>

      {/* Children section below */}
      <VStack spacing={2} align="start" mt={[4, 4, 0]}>
        <Heading as="h4" size="md" mb={4} colorScheme="brand" >
          {firstName} {lastName} Barn:
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} spacing={4} width="full">
          {children.map((child, index) => (
            <Box
              key={index}
              borderWidth="1px"
              borderTopRadius="lg"
              borderBottomLeftRadius="lg"
              borderBottomRightRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              p={0}
              pb={4}
              bg="white"
              transition="0.2s"
            >

              <Box
                bg={roleColors[child.role] || 'gray.200'}
                borderTopRadius="lg"
                p={4}
              >
              </Box>

              <Text
                fontSize={{ base: "md", sm: "lg" }}
                fontWeight="bold"
                color={roleColors[child.role] || 'gray.200'}
                mt={2}
                pl={4}
              >
                {child.role.charAt(0).toUpperCase() + child.role.slice(1).toLowerCase()}: {child.firstName}
              </Text>

              <Text
                fontSize={{ base: "sm", sm: "md" }}
                color="black"
                mt={1}
                noOfLines={2}
                pl={4}
                pr={4}
              >
                (Telefon: {child.phone || 'N/A'})
              </Text>

              <HStack mt={2} spacing={2} alignItems="center" width="full">
                <Select
                  value={child.role}
                  onChange={(e) => handleRoleChange(index, e.target.value)}
                  width={{ base: "100%", md: "fit-content" }}
                  maxWidth="100%"
                  color="black"
                  bg="white"
                  pl={4}
                >
                  <option value="kutar">Kutar  (0-9 år)</option>
                  <option value="tumlare">Tumlare  (0-9 år)</option>
                  <option value="upptäckare">Upptäckare (10-11år)</option>
                  <option value="äventyrare">Äventyrare (12-14 år)</option>
                  <option value="utmanare">Utmanare (15-18 år)</option>
                  <option value="rover">Rover (19-25 år) </option>
                </Select>

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

                <Spacer />

                <Button
                  colorScheme="red"
                  onClick={() => handleRemoveChild(index)}
                  variant="outline"
                  aria-label="Remove Child"
                  mr={4}
                >
                  <Icon as={FaTrash} color="red.500" />
                </Button>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>

        <Heading as="h4" size="md" mt={6} colorScheme="brand">
          Bilar:
        </Heading>
        <SimpleGrid mt={3} columns={[1, 1, 2]} spacing={4} width="full">
          {cars.map((car, index) => (
            car ? (
              <Box
                key={index}
                borderWidth="1px"
                borderTopRadius="lg"
                borderBottomRadius="lg"
                overflow="hidden"
                boxShadow="lg"
                p={4}
                bg="white"
                borderColor="gray.300"
              >
            
                <Box
                  bg={fuelTypeColors[car.fuel_type] || 'gray.200'}
                  borderTopRadius="lg"
                  p={3}
                >
                  <Text fontSize="lg" fontWeight="bold" color="black">
                    {car.model_name || 'Unknown Model'} - {car.reg_number ? car.reg_number.toUpperCase() : 'Unknown Reg'}
                  </Text>
                </Box>

                <HStack justifyContent="space-between" mt={3} alignItems="center">
                  <Text
                    fontSize={{ base: "sm", sm: "md" }}
                    color="black"
                  >
                    Bränsletyp: {car.fuel_type || 'Unknown'}
                  </Text>

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
            ) : null
          ))}
        </SimpleGrid>
      </VStack>

      <Divider mb={6} />

      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setAddChildOpen(false)}
        onChildAdded={handleChildAdded}
      />

      <Modal isOpen={isAddressInfoOpen} onClose={() => setNewInfoOpen(false)}>
        <ModalOverlay />
        <ModalContent
          maxW={{ base: '90%', sm: '500px', lg: '800px' }}
          p={4}
        >
          <ModalHeader fontSize={{ base: 'lg', lg: '2xl' }}>Redigera profil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              gap={8}
              justifyContent="space-between"
            >
              <Box flex="1">
                <FormControl>
                  <FormLabel>E-post</FormLabel>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Skriv in din nya e-postadress"
                    type="email"
                    isRequired
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

              <Box flex="1">
                <FormControl>
                  <FormLabel>Adress</FormLabel>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Skriv in din adress"
                    isRequired
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Postnummer</FormLabel>
                  <Input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Skriv in postnummer"
                    isRequired
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Stad</FormLabel>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Skriv in stad"
                    isRequired
                  />
                </FormControl>

                <Box mt={6} w="full">
                  <Heading as="h4" size="md" mb={4}>
                    Notisinställningar
                  </Heading>
                  <Checkbox
                    isChecked={notificationPreferences.chat_notifications || false}
                    onChange={(e) => handleNotificationChange('chat_notifications', e.target.checked)}
                  >
                    Skicka e-postnotiser om nya chattmeddelanden
                  </Checkbox>
                  <Checkbox
                    isChecked={notificationPreferences.passenger_notifications || false}
                    onChange={(e) => handleNotificationChange('passenger_notifications', e.target.checked)}
                  >
                    Skicka e-postnotiser om förändringar i passagerarlistan
                  </Checkbox>
                </Box>

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
      
      <AddCarModal
        isOpen={isAddCarOpen}
        onClose={() => setAddCarOpen(false)}
        onCarAdded={handleCarAdded}
      />
    </Box>
  );
};

export default Profile;
