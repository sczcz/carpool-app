import React from 'react';
import { VStack, Spinner, Text } from '@chakra-ui/react';

const LoadingState = ({ message = 'Laddar...', size = 'lg', color = 'brand.500' }) => (
  <VStack>
    <Spinner size={size} color={color} />
    <Text>{message}</Text>
  </VStack>
);

export default LoadingState;