import React from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  Flex,
  Collapse,
  Tag,
  TagLabel,
  Spinner,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaPlus, FaCarSide, FaTrash } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import CarpoolList from '../carpool/CarpoolList';

const ActivityList = ({
  activities = [],
  openIndex,
  onToggle, // (index, activityId) => void
  onOpenCarpoolModal, // (activityId) => void
  fetchingCarpools,
  roleColors = {},
  userId,
  joinedChildrenInCarpool = {},
  checkIfAllChildrenJoined,
  handleJoinCarpool,
  loadingJoinState = {},
  handleDeleteCarpool,
  openChatModal,
  translateCarpoolType,
  onCarpoolClick, // (activity, carpool) => void
}) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
      {activities.map((activity, index) => (
        <Box key={activity.activity_id} borderWidth="1px" borderRadius="lg" p={4} boxShadow="md" bg="white">
          <Flex justify="space-between" align="center" mb={2}>
            <Tag size="lg" color="white" backgroundColor={roleColors[activity.scout_level] || 'gray.200'} borderRadius="full">
              <TagLabel>{activity.scout_level?.charAt(0).toUpperCase() + (activity.scout_level?.slice(1) || '')}</TagLabel>
            </Tag>
            <Button
              colorScheme="brand"
              size="sm"
              onClick={() => onToggle && onToggle(index, activity.activity_id)}
            >
              {openIndex === index ? 'Dölj samåkning' : 'Visa samåkning'}
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

          <Collapse in={openIndex === index} animateOpacity>
            <Box mt={2} maxHeight="250px" overflowY="auto">
              <CarpoolList
                activity={activity}
                carpools={activity.carpools}
                fetchingCarpools={fetchingCarpools}
                onOpenCarpoolModal={onOpenCarpoolModal}
                userId={userId}
                joinedChildrenInCarpool={joinedChildrenInCarpool}
                checkIfAllChildrenJoined={checkIfAllChildrenJoined}
                onJoinCarpool={handleJoinCarpool}
                loadingJoinState={loadingJoinState}
                onDeleteCarpool={handleDeleteCarpool}
                onOpenChat={openChatModal}
                onCarpoolClick={onCarpoolClick}
                translateCarpoolType={translateCarpoolType}
                roleColors={roleColors}
              />
            </Box>
          </Collapse>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ActivityList;