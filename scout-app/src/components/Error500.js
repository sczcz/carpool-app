import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Error500 = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h1" size="2xl" color="red.500" mb={4}>
        ERROR 500
      </Heading>
      <Text fontSize="xl" color="gray.500" mb={6}>
      Något gick fel hos oss. Försök igen senare.
      </Text>
      <Link to="/">
        <Button colorScheme="teal" size="lg">
          Gå tillbaka till start
        </Button>
      </Link>
    </Box>
  );
};

export default Error500;
