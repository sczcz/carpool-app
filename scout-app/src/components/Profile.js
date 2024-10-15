import React, { useState } from 'react';
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
} from '@chakra-ui/react';

const Profile = () => {
  // Användarinformation (placeholders)
  const [firstName, setFirstName] = useState('Anna');
  const [lastName, setLastName] = useState('Andersson');
  const [email, setEmail] = useState('anna.andersson@example.com');
  const [role, setRole] = useState('Vårdnadshavare');
  
  // Adressinformation
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');

  // Barninformation
  const [children, setChildren] = useState([]);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childRole, setChildRole] = useState('Spårare');

  const handleAddChild = () => {
    if (childFirstName && childLastName) {
      setChildren([...children, { firstName: childFirstName, lastName: childLastName, role: childRole }]);
      setChildFirstName('');
      setChildLastName('');
      setChildRole('Spårare');
    }
  };

  const handleRemoveChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
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
    <Box p={5}>
      <Heading as="h2" size="lg" mb={4} color="brand.500">
        Profil
      </Heading>
      <Divider mb={6} />

      <VStack spacing={4} align="start">
        <Text fontSize="lg" color="brand.600">
          <strong>Namn:</strong> {firstName} {lastName}
        </Text>
        <Text fontSize="lg" color="brand.600">
          <strong>E-post:</strong> {email}
        </Text>
        <Text fontSize="lg" color="brand.600">
          <strong>Roll:</strong> {role}
        </Text>
        <Text fontSize="lg" color="brand.600">
          <strong>Adress:</strong> {address}, {postcode}, {city}
        </Text>
      </VStack>

      <Divider my={6} />

      <Heading as="h3" size="md" mb={4} color="brand.500">
        Uppdatera Adress
      </Heading>
      <VStack spacing={4} align="start">
        <FormControl>
          <FormLabel>Adress</FormLabel>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Skriv in din adress"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Postnummer</FormLabel>
          <Input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Skriv in ditt postnummer"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Ort</FormLabel>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Skriv in din ort"
          />
        </FormControl>
        <Button colorScheme="brand" onClick={() => alert(`Adress sparad: ${address}, ${postcode}, ${city}`)}>
          Spara Adress
        </Button>
      </VStack>

      <Divider my={6} />

      <Heading as="h3" size="md" mb={4} color="brand.500">
        Lägg till Barn
      </Heading>
      <VStack spacing={4} align="start">
        <FormControl>
          <FormLabel>Förnamn</FormLabel>
          <Input
            value={childFirstName}
            onChange={(e) => setChildFirstName(e.target.value)}
            placeholder="Förnamn"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Efternamn</FormLabel>
          <Input
            value={childLastName}
            onChange={(e) => setChildLastName(e.target.value)}
            placeholder="Efternamn"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Roll</FormLabel>
          <Select
            value={childRole}
            onChange={(e) => setChildRole(e.target.value)}
          >
            <option value="Spårare">Spårare</option>
            <option value="Upptäckare">Upptäckare</option>
            <option value="Äventyrare">Äventyrare</option>
            <option value="Utmanare">Utmanare</option>
            <option value="Rövare">Rövare</option>
          </Select>
        </FormControl>
        <Button colorScheme="brand" onClick={handleAddChild}>
          Lägg till Barn
        </Button>
      </VStack>

      <Divider my={6} />

      <Heading as="h4" size="md" mb={4} color="brand.500">
        Barn tillagd
      </Heading>
      <VStack spacing={2} align="start">
        {children.map((child, index) => (
          <HStack key={index} spacing={4} alignItems="center">
            <Text fontSize="lg" color="brand.600">
              {child.firstName} {child.lastName} - {child.role}
            </Text>
            <Select
              value={child.role}
              onChange={(e) => handleUpdateChild(index, e.target.value)}
              width="150px"
            >
              <option value="3">Spårare</option>
              <option value="4">Upptäckare</option>
              <option value="5">Äventyrare</option>
              <option value="6">Utmanare</option>
              <option value="7">Rövare</option>
            </Select>
            <Button colorScheme="red" onClick={() => handleRemoveChild(index)}>
              Ta bort
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default Profile;
