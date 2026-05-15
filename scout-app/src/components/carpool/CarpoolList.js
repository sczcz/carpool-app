import React from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { FaPlus, FaCarSide } from 'react-icons/fa';
import CarpoolItem from './CarpoolItem';

const CarpoolList = ({
  activity,
  carpools = [],
  fetchingCarpools = false,
  onOpenCarpoolModal,       // (activityId) => void
  userId,
  joinedChildrenInCarpool = {},
  checkIfAllChildrenJoined, // async (carpoolId) => bool
  onJoinCarpool,            // (carpoolId, activityId) => void
  loadingJoinState = {},
  onDeleteCarpool,          // (carpoolId, activityId) => void
  onOpenChat,               // (carpoolId) => void
  onCarpoolClick,           // (activity, carpool) => void
  translateCarpoolType,     // (type) => string
  roleColors = {},          // { scout_level: color }
}) => {
  return (
    <VStack spacing={4}>
      <Button
        rightIcon={<FaPlus />}
        leftIcon={<FaCarSide />}
        colorScheme="brand"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCarpoolModal && onOpenCarpoolModal(activity.activity_id);
        }}
      >
        Lägg till samåkning
      </Button>

      {fetchingCarpools ? (
        <Spinner />
      ) : Array.isArray(carpools) && carpools.length > 0 ? (
        carpools.map((carpool) => (
          <CarpoolItem
            key={carpool.id}
            activity={activity}
            carpool={carpool}
            userId={userId}
            joinedChildrenInCarpool={joinedChildrenInCarpool}
            checkIfAllChildrenJoined={checkIfAllChildrenJoined}
            onJoin={onJoinCarpool}
            loadingJoinState={loadingJoinState}
            onDelete={onDeleteCarpool}
            onOpenChat={onOpenChat}
            onClick={onCarpoolClick}
            translateCarpoolType={translateCarpoolType}
            roleColors={roleColors}
          />
        ))
      ) : (
        <Text>Inga tillgängliga samåkningar för denna aktivitet.</Text>
      )}
    </VStack>
  );
};

export default CarpoolList;