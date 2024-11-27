import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  HStack,
  Button,
  Text,
  Select,
  Card,
  CardBody,
  CardFooter,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useUser } from "../utils/UserContext";

const DashBoardAdmin = () => {
  const { roles, isInitialized, fetchUserData } = useUser();
  const [unacceptedUsers, setUnacceptedUsers] = useState([]); // State för icke-accepterade användare
  const toast = useToast(); // Chakra UI toast för notifieringar
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState(""); // Defaultvärde är en tom sträng

  // Breakpoint-specific button size
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  const promoteToAdmin = (userId) => {
    fetch('/api/admin/make-admin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // Uppdatera allUsers för att reflektera ändringen
          setAllUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId
                ? { ...user, roles: [...user.roles, 'admin'] }
                : user
            )
          );
          toast({
            title: 'Uppgradering lyckades',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else if (data.error) {
          toast({
            title: 'Fel vid uppgradering',
            description: data.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Serverfel',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  };


  useEffect(() => {
    fetch('/api/users/all', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) { // Kontrollera att data är en array
          setAllUsers(data); // Uppdatera allUsers med hämtade data
        } else {
          console.error('Data från backend är inte en array:', data);
        }
      })
      .catch((err) =>
        toast({
          title: 'Fel vid hämtning av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast]);



  // Hämta icke-accepterade användare vid laddning
  useEffect(() => {
    fetch('/api/admin/unaccepted-users', {
      method: 'GET',
      credentials: 'include', // Skickar cookies för autentisering
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.unaccepted_users) {
          setUnacceptedUsers(data.unaccepted_users);
        }
      })
      .catch((err) =>
        toast({
          title: 'Fel vid hämtning av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast]);

  // Funktion för att acceptera en användare
  const acceptUser = (userId) => {
    fetch('/api/admin/accept-user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // Uppdatera state för att ta bort accepterad användare
          setUnacceptedUsers((prev) => prev.filter((user) => user.user_id !== userId));
          toast({
            title: 'Användare accepterad',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Fel vid accepterande av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  };

  const deleteUser = (userId) => {
    fetch(`/api/admin/delete-user/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // Uppdatera både unacceptedUsers och allUsers
          setUnacceptedUsers((prev) => prev.filter((user) => user.user_id !== userId));
          setAllUsers((prev) => prev.filter((user) => user.id !== userId)); // Uppdatera allUsers
          toast({
            title: 'Användare borttagen',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Fel vid borttagning av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  };


  return (
    <Box p={[4, 6]}>
      {/* Page Heading */}
      <Heading mb={[4, 8]} as="h1" size="xl" textAlign={["center", "left"]}>
        Admin Dashboard
      </Heading>

      {/* Pending User Approvals Section */}
      <Box mb={[6, 12]}>
        <Heading as="h2" size="lg" mb={[2, 4]} textAlign={["center", "left"]}>
          Inväntar på att accepteras
        </Heading>
        <Box
          maxWidth="100%"
          overflowX="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          whiteSpace="nowrap"
        >
          <Box
            display="grid"
            gridTemplateRows="repeat(2, auto)"
            gridAutoFlow="column"
            gap="16px"
          >
            {unacceptedUsers.map((user, idx) => (
              <Card
                key={user.user_id}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                minWidth="250px"
              >
                <CardBody>
                  <Text fontWeight="bold" fontSize="md">
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    E-post: {user.email}
                  </Text>
                </CardBody>
                <CardFooter>
                  <HStack
                    spacing={4}
                    justify="center"
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Button
                      colorScheme="green"
                      size={buttonSize}
                      borderRadius="full"
                      width={["100%", "auto"]}
                      onClick={() => acceptUser(user.user_id)}
                    >
                      Acceptera
                    </Button>
                    <Button
                      colorScheme="red"
                      size={buttonSize}
                      borderRadius="full"
                      width={["100%", "auto"]}
                      onClick={() => deleteUser(user.user_id)}
                    >
                      Ta Bort
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Active Users Section */}
      <Box>
        <HStack justifyContent="space-between" mb={4} flexWrap="wrap">
          <Heading as="h2" size="lg" mb={[2, 0]} textAlign={["center", "left"]}>
            Aktiva Användare
          </Heading>
          <Select
            maxW="200px"
            placeholder="Filter"
            size="md"
            borderRadius="lg"
            onChange={(e) => setFilter(e.target.value)} // Uppdaterar filter
            value={filter} // Binder valt värde
          >
            <option value="vårdnadshavare">Vårdnadshavare</option>
            <option value="ledare">Ledare</option>
            <option value="vuxenscout">Vuxenscout</option>
          </Select>
        </HStack>
        <Box
          maxWidth="100%"
          overflowX="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          whiteSpace="nowrap"
        >
          <Box
            display="grid"
            gridTemplateRows="repeat(2, auto)"
            gridAutoFlow="column"
            gap="16px"
          >
            {Array.isArray(allUsers) &&
              allUsers
                .filter((user) => (filter ? user.roles.includes(filter) : true)) // Filtrerar baserat på roll
                .map((user, idx) => (
                  <Card
                    key={idx}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="lg"
                    minWidth="250px"
                  >
                    <CardBody>
                      <Text fontWeight="bold" fontSize="md">
                        {user.first_name} {user.last_name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Roller: {user.roles.join(", ")}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        E-post: {user.email}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Senast inloggad: {user.last_logged_in ? new Date(user.last_logged_in).toLocaleString() : "Aldrig"}
                      </Text>
                    </CardBody>
                    <CardFooter>
                      <HStack
                        spacing={4}
                        justify="center"
                        flexWrap="wrap"
                        alignItems="center"
                      >
                        <Button
                          colorScheme="red"
                          size={buttonSize}
                          borderRadius="full"
                          width={["100%", "auto"]}
                          onClick={() => deleteUser(user.id)}
                        >
                          Ta Bort
                        </Button>
                        {user.roles.includes("ledare") && !user.roles.includes("admin") && (
                          <Button
                            bg="brand.500"
                            _hover={{ bg: "brand.600" }}
                            color="white"
                            size={buttonSize}
                            borderRadius="full"
                            width={["100%", "auto"]}
                            onClick={() => promoteToAdmin(user.id)} // Koppla funktionen till onClick
                          >
                            Gör Admin
                          </Button>
                        )}

                      </HStack>
                    </CardFooter>
                  </Card>
                ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashBoardAdmin;
