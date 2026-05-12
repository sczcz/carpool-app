import React from 'react';
import { HStack, Icon, Heading, Box } from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';

const DashboardHeader = ({ fullName }) => (
  <Box mb={5}>
    <HStack spacing={4} align="center">
      <Icon as={FaUserCircle} w={8} h={8} color="brand.500" />
      <Heading as="h1" size="lg" color="brand.500">
        Välkommen, {fullName}
      </Heading>
    </HStack>
  </Box>
);

export default DashboardHeader;