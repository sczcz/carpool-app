import React from 'react';
import { Box, Flex, Text, Button, Icon, Spinner, Tag, TagLabel } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

const CarpoolItem = ({
  activity,
  carpool,
  userId,
  joinedChildrenInCarpool = {},
  checkIfAllChildrenJoined,
  onJoin, // (carpoolId, activityId) => void
  loadingJoinState = {},
  onDelete, // (carpoolId, activityId) => void
  onOpenChat, // (carpoolId) => void
  onClick, // (activity, carpool) => void (for Info / container click)
  translateCarpoolType,
  roleColors = {},          // { scout_level: color }
}) => {
  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      w="100%"
      bg="gray.50"
      boxShadow="sm"
      fontSize={{ base: 'sm', sm: 'md' }}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(activity, carpool); }}
      cursor="pointer"
      _hover={{ bg: 'gray.100' }}
    >
        <Flex direction="column"> 
            <Flex justify="space-between" mb={2} align="center"> 
                <Tag size="sm" color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full" mr={2}> 
                    <TagLabel> {activity.scout_level?.charAt(0).toUpperCase() + (activity.scout_level?.slice(1) || '')} </TagLabel> 
                </Tag>
          <Text fontSize="md" color="brand.600" flex="1" noOfLines={1}>
            {carpool.departure_address}
            {carpool.carpool_type === 'drop-off' && <span style={{ margin: '0 8px', color: 'gray.600' }}>→</span>}
            {carpool.carpool_type === 'pick-up' && <span style={{ margin: '0 8px', color: 'gray.600' }}>←</span>}
            {carpool.carpool_type === 'both' && <span style={{ margin: '0 8px', color: 'gray.600' }}>↔</span>}
            {activity.location} ({translateCarpoolType?.(carpool?.carpool_type) || 'N/A'})
          </Text>
        </Flex>

        <Text fontSize="sm" color="gray.500" mb={2}>
          Tillgängliga platser: {carpool.available_seats}
        </Text>

        <Flex justify="flex-end" gap="2" mt="auto">
          {carpool.driver_id === userId && (
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(carpool.id, activity.activity_id);
              }}
            >
              <Icon as={FaTrash} color="red.500" />
            </Button>
          )}

          {carpool.available_seats > 0 ? (
            <Button
              colorScheme={joinedChildrenInCarpool[carpool.id]?.allJoined ? 'blue' : 'green'}
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                const allChildrenJoined = await (checkIfAllChildrenJoined ? checkIfAllChildrenJoined(carpool.id) : false);
                if (allChildrenJoined) return;
                onJoin && onJoin(carpool.id, activity.activity_id);
              }}
              isDisabled={joinedChildrenInCarpool[carpool.id]?.allJoined}
            >
              {loadingJoinState[carpool.id] ? <Spinner size="xs" /> : (joinedChildrenInCarpool[carpool.id]?.allJoined ? 'Bokad' : 'Boka')}
            </Button>
          ) : (
            <Button colorScheme="red" size="sm" isDisabled>
              Full
            </Button>
          )}

          <Button
            colorScheme="teal"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat && onOpenChat(carpool.id);
            }}
          >
            Chatt
          </Button>

          <Button
            display={{ base: 'inline-flex', md: 'none' }}
            colorScheme="cyan"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(activity, carpool);
            }}
          >
            Info
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default CarpoolItem;