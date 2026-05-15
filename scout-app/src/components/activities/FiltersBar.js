import React from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

const FiltersBar = ({ filterByRole, onToggleFilter, onAddChild }) => (
  <Box mb={4}>
    <HStack spacing={3}>
      <Button
        fontSize={{ base: 'sm', lg: 'md' }}
        colorScheme="gray"
        onClick={onToggleFilter}
      >
        {filterByRole
          ? 'Visa alla aktiviteter'
          : 'Visa endast aktiviteter baserat på dina barns roller'}
      </Button>

      <Button
        size="sm"
        rightIcon={<FaPlus />}
        colorScheme="brand"
        onClick={onAddChild}
      >
        Lägg till barn
      </Button>
    </HStack>
  </Box>
);

export default FiltersBar;