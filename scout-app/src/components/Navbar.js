import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Text, Spacer, Button } from '@chakra-ui/react'; // Importera Chakra UI komponenter

const Navbar = () => {
  return (
    <Box as="nav" bg="teal.500" color="white" p={4}>
      <Flex alignItems="center">
        <Text fontSize="xl" fontWeight="bold">
          <Link to="/">MyWebsite</Link>
        </Text>
        <Spacer />
        <Flex gap={4}>
          <Button as={Link} to="/login" variant="outline" colorScheme="whiteAlpha">Login</Button>
          <Button as={Link} to="/register" variant="outline" colorScheme="whiteAlpha">Register</Button>
          <Button as={Link} to="/FetchUsers" variant="outline" colorScheme="whiteAlpha">Fetch Users</Button>
          <Button as={Link} to="/TestSession" variant="outline" colorScheme="whiteAlpha">Test Session</Button>
          <Button as={Link} to="/logout" variant="outline" colorScheme="whiteAlpha">Logout</Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
