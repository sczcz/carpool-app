import React, { useState } from "react";
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
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";

const CreateActivityModal = ({ isOpen, onClose, onActivityCreated }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roleId, setRoleId] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/protected/activity/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          start_date: startDate,
          end_date: endDate,
          role_id: parseInt(roleId, 10),
          address,
          description,
          is_visible: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Misslyckades med att skapa aktiviteten.");
      }

      const data = await response.json();
      toast({
        title: "Aktivitet skapad",
        description: "Aktiviteten har skapats framgångsrikt.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onActivityCreated();
      onClose();
    } catch (error) {
      toast({
        title: "Fel",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Skapa ny aktivitet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Namn</FormLabel>
            <Input
              placeholder="Namn på aktivitet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Startdatum</FormLabel>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Slutdatum</FormLabel>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Roll</FormLabel>
            <Select
              placeholder="Välj roll"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="3">Kutar</option>
              <option value="4">Tumlare</option>
              <option value="5">Upptäckare</option>
              <option value="6">Äventyrare</option>
              <option value="7">Utmanare</option>
              <option value="8">Rover</option>
              <option value='2'>Ledare</option>
              <option value='10'>Vuxenscout</option>
            </Select>
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Adress</FormLabel>
            <Input
              placeholder="Plats för aktiviteten"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Beskrivning</FormLabel>
            <Textarea
              placeholder="Beskrivning av aktiviteten"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Skapa
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Avbryt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateActivityModal;
