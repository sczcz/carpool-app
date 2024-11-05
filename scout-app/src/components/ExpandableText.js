import React, { useState } from 'react';
import { Text, Button, Box, useBreakpointValue } from '@chakra-ui/react';

const ExpandableText = ({ text, fontSize }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamiskt antal tecken baserat på skärmstorlek
  const MAX_LENGTH = useBreakpointValue({ base: 80, sm: 120, md: 200, lg: 300, xl: 400 });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const isLongText = text.length > MAX_LENGTH;

  return (
    <Box>
      <Text fontSize={fontSize} whiteSpace="pre-wrap">
        {isExpanded || !isLongText ? text : `${text.substring(0, MAX_LENGTH)}...`}
      </Text>
      
      {isLongText && (
        <Button size="xs" onClick={toggleExpand} variant="link" color="blue.600" fontWeight="bold" mt={2}>
        {isExpanded ? 'Mindre' : 'Mer'}
      </Button>
      
      )}
    </Box>
  );
};

export default ExpandableText;
