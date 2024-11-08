// AddCarModal.js
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
} from '@chakra-ui/react';

const AddCarModal = ({ isOpen, onClose, onCarAdded }) => {
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Gas');
  const [consumption, setConsumption] = useState('');
  const [modelName, setModelName] = useState('');
  const toast = useToast();

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
          toast({
            title: 'Bil tillagd!',
            description: 'Bilen har lagts till i listan.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          const newCar = { reg_number: regNumber, model_name: modelName, fuel_type: fuelType, consumption };
            onCarAdded(newCar); // Pass new car to parent component
            onClose(); // Close the modal

          // Reset form fields
          setRegNumber('');
          setFuelType('Gas');
          setConsumption('');
          setModelName('');
        } else {
          const error = await response.json();
          toast({
            title: 'Fel',
            description: error.message || 'Misslyckades att lägga till bil',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Fel',
          description: 'Ett fel uppstod vid tillägg av bil',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Fel',
        description: 'Fyll i alla fält',
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
        <ModalHeader>Lägg till bil</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Registreringsnummer</FormLabel>
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
              <option value="Electric">El</option>
              <option value="Gas">Bensin</option>
              <option value="Hybrid">Hybrid</option>
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Konsumtion (L eller kWh)</FormLabel>
            <Input
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              placeholder="Ange bränslekonsumtion"
              type="number"
              step="0.1"
              isRequired
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Modellnamn</FormLabel>
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
          <Button ml={3} onClick={onClose}>
            Avbryt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCarModal;
