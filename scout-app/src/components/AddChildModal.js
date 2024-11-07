// AddChildModal.js
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';

const AddChildModal = ({ isOpen, onClose, onChildAdded }) => {
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childRole, setChildRole] = useState('kutar');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [childPhone, setChildPhone] = useState('');
  const toast = useToast();

  const handleAddChild = async () => {
    if (childFirstName && childLastName && membershipNumber) {
      try {
        const response = await fetch('/api/protected/add-child', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            membership_number: membershipNumber,
            first_name: childFirstName,
            last_name: childLastName,
            phone: childPhone,
            role: childRole,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: 'Barn tillagt framgångsrikt!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          onChildAdded({ firstName: childFirstName, lastName: childLastName, role: childRole, membershipNumber, phone: childPhone });
          onClose();
          setChildFirstName('');
          setChildLastName('');
          setChildRole('kutar');
          setMembershipNumber('');
          setChildPhone('');
        } else {
          const error = await response.json();
          toast({
            title: 'Fel',
            description: error.message || 'Misslyckades att lägga till barn',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Fel vid tillägg av barn:', error);
        toast({
          title: 'Ett fel uppstod vid tillägg av barnet',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Fel',
        description: 'Du måste fylla i förnamn, efternamn och medlemsnummer för barnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Lägg till Barn</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Förnamn</FormLabel>
            <Input value={childFirstName} onChange={(e) => setChildFirstName(e.target.value)} placeholder="Förnamn" isRequired />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Efternamn</FormLabel>
            <Input value={childLastName} onChange={(e) => setChildLastName(e.target.value)} placeholder="Efternamn" isRequired />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Roll</FormLabel>
            <Select value={childRole} onChange={(e) => setChildRole(e.target.value)}>
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
            <Input value={membershipNumber} onChange={(e) => setMembershipNumber(e.target.value)} placeholder="Skriv in medlemsnummer" isRequired />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Telefonnummer</FormLabel>
            <Input value={childPhone} onChange={(e) => setChildPhone(e.target.value)} placeholder="Skriv in telefonnummer" isRequired />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleAddChild}>
            Spara
          </Button>
          <Button ml={3} onClick={onClose}>
            Avbryt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddChildModal;
