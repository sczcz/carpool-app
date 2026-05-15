import React from 'react';
import { Box, Flex, Tag, TagLabel, Button, Text, Collapse } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

const ActivityCard = ({
  activity,
  index,
  isOpen,
  onToggle,      // function (index, activityId)
  roleColors = {},
  children,      // carpool list JSX (rendered inside Collapse)
}) => {
  const handleToggle = () => {
    if (onToggle) onToggle(index, activity.activity_id);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="white">
      <Flex justify="space-between" align="center" mb={2}>
        <Tag size="lg" color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full">
          <TagLabel>
            {activity.scout_level?.charAt(0).toUpperCase() + (activity.scout_level?.slice(1) || '')}
          </TagLabel>
        </Tag>

        <Button colorScheme="brand" size="sm" onClick={handleToggle}>
          {isOpen ? 'Dölj samåkning' : 'Visa samåkning'}
        </Button>
      </Flex>

      <Text fontWeight="bold">
        {format(parseISO(activity.dtstart), "d MMMM", { locale: sv })}
      </Text>
      <Text fontSize="sm" color="gray.600">
        Start: {format(parseISO(activity.dtstart), "HH:mm", { locale: sv })}
      </Text>

      <Text>{activity.location}</Text>
      <Text mt={2}>{activity.summary?.split('//')[0]}</Text>

      <Collapse in={isOpen} animateOpacity>
        <Box mt={2} maxHeight="250px" overflowY="auto">
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ActivityCard;