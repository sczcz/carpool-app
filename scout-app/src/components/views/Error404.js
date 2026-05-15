import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h1" size="2xl" color="red.500" mb={4}>
        ERROR 404
      </Heading>
      <Text fontSize="xl" color="gray.500" mb={6}>
        Oops! Sidan du letar efter finns inte.
      </Text>
      <Link to="/">
        <Button colorScheme="teal" size="lg">
          Gå tillbaka till start
        </Button>
      </Link>
    </Box>
  );
};

export default Error404;
