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
  const [childPhone, setChildPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const toast = useToast();

  const handleAddChild = async () => {
    if (!childFirstName || !childLastName || !childRole || !birthDate) {
      toast({
        title: 'Fel',
        description: 'Du måste fylla i förnamn, efternamn, roll och födelsedatum för barnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/protected/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: childFirstName,
          last_name: childLastName,
          phone: childPhone || null,
          role: childRole,
          birth_date: birthDate,
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
        onChildAdded({
          firstName: childFirstName,
          lastName: childLastName,
          role: childRole,
          phone: childPhone,
          birthDate,
        });
        onClose();
        setChildFirstName('');
        setChildLastName('');
        setChildRole('kutar');
        setChildPhone('');
        setBirthDate('');
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Lägg till barn</ModalHeader>
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
              <option value="kutar">Kutar (0-9 år)</option>
              <option value="tumlare">Tumlare (0-9 år)</option>
              <option value="upptäckare">Upptäckare (10-11år)</option>
              <option value="äventyrare">Äventyrare (12-14 år)</option>
              <option value="utmanare">Utmanare (15-18 år)</option>
              <option value="rover">Rover (19-25 år)</option>
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Födelsedatum</FormLabel>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="Välj födelsedatum"
              isRequired
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Telefonnummer (valfritt)</FormLabel>
            <Input value={childPhone} onChange={(e) => setChildPhone(e.target.value)} placeholder="Skriv in telefonnummer" />
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
