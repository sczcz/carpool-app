import React, { useEffect } from "react";
import { InfoIcon } from '@chakra-ui/icons';
import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { useRef } from 'react';
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
  PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
} from "@chakra-ui/react";
import useRoleProtection from "../utils/useRoleProtection";
import useAdminUsers from "../hooks/useAdminUsers";

const DashBoardAdmin = () => {
  useRoleProtection(["admin"]);
  const toast = useToast();
  const cancelRef = useRef();
  const [filter, setFilter] = useState("");

  const {
    unacceptedUsers,
    allUsers,
    isDeleteDialogOpen,
    userToDelete,
    fetchUnacceptedUsers,
    fetchAllUsers,
    openDeleteDialog,
    closeDeleteDialog,
    promoteToAdmin,
    acceptUser,
    confirmDeleteUser,
    clearOldActivities,
  } = useAdminUsers(toast);

  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  useEffect(() => {
    fetchUnacceptedUsers();
    fetchAllUsers();
  }, [fetchUnacceptedUsers, fetchAllUsers]);

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      confirmDeleteUser(userToDelete);
    }
  };

  return (
    <Box width="100%" maxW="1200px" mx="auto" p={[4, 6]}>
      {/* Page Heading */}
      <Box mb={8} display="flex" alignItems="center">
        <Heading as="h1" size="xl" textAlign={["center", "left"]}>
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
            {unacceptedUsers.map((user) => (
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
                      onClick={handleDeleteConfirm}
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
                .map((user) => (
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

      {/* Cleanup section */}
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