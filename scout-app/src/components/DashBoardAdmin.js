import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InfoIcon } from '@chakra-ui/icons';
import { FaTrash, FaCarSide} from 'react-icons/fa';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
  IconButton, 
  Popover, 
  PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody,
} from "@chakra-ui/react";
import { useUser } from "../utils/UserContext";
import useRoleProtection from "../utils/useRoleProtection";

const DashBoardAdmin = () => {
  useRoleProtection(["admin"]);
  const { isInitialized, fetchUserData, hasRole } = useUser();
  const [unacceptedUsers, setUnacceptedUsers] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const cancelRef = useRef();

  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  const openDeleteDialog = (userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

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
        if (Array.isArray(data)) {
          setAllUsers(data);
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

  useEffect(() => {
    fetch('/api/admin/unaccepted-users', {
      method: 'GET',
      credentials: 'include',
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
          setUnacceptedUsers((prev) => prev.filter((user) => user.id !== userId));
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

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    fetch(`/api/admin/delete-user/${userToDelete}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setUnacceptedUsers((prev) =>
            prev.filter((user) => user.id !== userToDelete)
          );
          setAllUsers((prev) =>
            prev.filter((user) => user.id !== userToDelete)
          );
          toast({
            title: "Användare borttagen",
            description: data.message,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
        closeDeleteDialog();
      })
      .catch((err) =>
        toast({
          title: "Fel vid borttagning av användare",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      );
  };

  const clearOldActivities = () => {
    fetch('/api/admin/cleanup-activities', {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          const { deleted_activities, deleted_carpools, deleted_passengers } = data;
          toast({
            title: 'Rensning klar',
            description: `${data.message}\nAktiviteter: ${deleted_activities}, Samåkningar: ${deleted_carpools}, Passagerare: ${deleted_passengers}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else if (data.error) {
          toast({
            title: 'Fel vid rensning',
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


  return (
    <Box width="100%" maxW="1200px" mx="auto" p={[4, 6]}>
      {/* Page Heading */}
      <Box mb={8} display="flex" alignItems="center">
        <Heading  as="h1" size="xl" textAlign={["center", "left"]}>
          Administratör
        </Heading>
        <Popover>
        <PopoverTrigger>
          <IconButton 
            icon={<InfoIcon />} 
            aria-label="Mer information" 
            variant="unstyled" 
            fontSize={{ base: 'l' }} 
            _hover={{ color: "gray.700" }}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <Text mb={2}>
              Här kan du som administratör hantera användare och aktiviteter på plattformen.
            </Text>
            
            <Text mb={2}>
              Du kan godkänna eller ta bort användare som väntar på godkännande.
            </Text>
            
            <Text mb={2}>
              För varje användare kan du också visa detaljer som deras roller, senaste inloggning och deras kontaktuppgifter.
            </Text>
            
            <Text mb={2}>
              Du har även möjlighet att befordra Ledare till adminstatus eller ta bort dem från plattformen.
            </Text>
            
            <Text>
              På dashboarden kan du även filtrera användare baserat på deras roller för att enkelt hantera dem, samt visa och hantera de aktiviteter som du är ansvarig för.
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>

            </Box>

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
                key={user.id}
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
                  <Text fontSize="sm" color="gray.500">
                    Senast inloggad: {user.last_logged_in}
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
                      onClick={() => acceptUser(user.id)}
                    >
                      Acceptera
                    </Button>
                    <Button
                      colorScheme="red"
                      size={buttonSize}
                      borderRadius="full"
                      width={["100%", "auto"]}
                      onClick={() => openDeleteDialog(user.id)}
                    >
                      Ta Bort
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            ))}

          <AlertDialog
            isOpen={isDeleteDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={closeDeleteDialog}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader>Bekräfta borttagning</AlertDialogHeader>
                <AlertDialogBody>
                  Detta raderar användarkontot samt all data kopplad till denne. Är du
                  säker?
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={closeDeleteDialog}>
                    Avbryt
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={confirmDeleteUser}
                    ml={3}
                  >
                    Radera
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          </Box>
        </Box>
      </Box>

      {/* Active users section */}
      <Box>
        <HStack justifyContent="space-between" mb={4} flexWrap="wrap">
          <Heading as="h2" size="lg" mb={[2, 0]} textAlign={["center", "left"]}>
            Aktiva användare
          </Heading>
          <Select
            maxW="200px"
            placeholder="Filter"
            size="md"
            borderRadius="lg"
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
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
                .filter((user) => (filter ? user.roles.includes(filter) : true))
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
                          onClick={() => openDeleteDialog(user.id)}
                        >
                          Ta bort
                        </Button>
                        {user.roles.includes("ledare") && !user.roles.includes("admin") && (
                          <Button
                            bg="brand.500"
                            _hover={{ bg: "brand.600" }}
                            color="white"
                            size={buttonSize}
                            borderRadius="full"
                            width={["100%", "auto"]}
                            onClick={() => promoteToAdmin(user.id)}
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
      <Box mt={8} textAlign="center">
        <HStack justify="flex-start" spacing={4}>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            size="md"
            borderRadius="full"
            onClick={clearOldActivities}
          >
            Rensa gamla aktiviteter från DB
          </Button>
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={<InfoIcon />}
                aria-label="Mer information"
                variant="ghost"
                fontSize="lg"
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody textAlign="left">
                <Text mb={2}>
                  Detta raderar gamla aktiviteter från databasen. Aktiviteter anses gamla om
                  slutdatumet passerat eller startdatum inträffade för mer än 3 månader sedan.
                </Text>
                <Text mb={2}>  
                  Detta rensar även samåkningar som är kopplade till aktiviteterna samt passagerare
                  som är kopplade till samåkningarna.
                </Text>
                <Text mb={2}>  
                  Utöver detta raderas även olästa notiser kopplade till ovanstående samåkningar.
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
      </Box>
    </Box>

  
  );
};

export default DashBoardAdmin;
