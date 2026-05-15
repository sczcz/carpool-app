import React from 'react';
import { VStack, Text, Button } from '@chakra-ui/react';

const ErrorState = ({ message = 'Ett fel uppstod', onRetry }) => (
  <VStack>
    <Text color="red.500" textAlign="center">{message}</Text>
    {onRetry && <Button onClick={onRetry} colorScheme="blue">Försök igen</Button>}
  </VStack>
);

export default ErrorState;