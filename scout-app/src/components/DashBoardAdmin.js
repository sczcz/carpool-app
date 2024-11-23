import React from "react";
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
} from "@chakra-ui/react";

const DashBoardAdmin = () => {
  // Breakpoint-specific button size
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <Box p={[4, 6]}>
      {/* Page Heading */}
      <Heading mb={[4, 8]} as="h1" size="xl" textAlign={["center", "left"]}>
        Admin Dashboard
      </Heading>

      {/* Pending User Approvals Section */}
      <Box mb={[6, 12]}>
        <Heading as="h2" size="lg" mb={[2, 4]} textAlign={["center", "left"]}>
          Invåntade på att accepteras
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
            {Array.from({ length: 10 }, (_, idx) => ({
              name: `User ${idx + 1}`,
              email: `user${idx + 1}@example.com`,
            })).map((user, idx) => (
              <Card
                key={idx}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                minWidth="250px"
              >
                <CardBody>
                  <Text fontWeight="bold" fontSize="md">
                    {user.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Email: {user.email}
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
                    >
                      Acceptera
                    </Button>
                    <Button
                      colorScheme="red"
                      size={buttonSize}
                      borderRadius="full"
                      width={["100%", "auto"]}
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
            Aktiv Användare
          </Heading>
          <Select
            maxW="200px"
            placeholder="Filter"
            size="md"
            borderRadius="lg"
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
            {Array.from({ length: 15 }, (_, idx) => ({
              name: `User ${String.fromCharCode(65 + idx)}`,
              role: idx % 3 === 0 ? "vårdnadshavare" : idx % 3 === 1 ? "ledare" : "vuxenscout",
            })).map((user, idx) => (
              <Card
                key={idx}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                minWidth="250px"
              >
                <CardBody>
                  <Text fontWeight="bold" fontSize="md">
                    {user.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Role: {user.role}
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
                      colorScheme="yellow"
                      size={buttonSize}
                      borderRadius="full"
                      width={["100%", "auto"]}
                    >
                      Inaktivera
                    </Button>
                    {user.role === "ledare" && (
                      <Button
                        bg="brand.500"
                        _hover={{ bg: "brand.600" }}
                        color="white"
                        size={buttonSize}
                        borderRadius="full"
                        width={["100%", "auto"]}
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
