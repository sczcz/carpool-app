import React from 'react';
import {
  Box,
  Heading,
  Text,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import ActivityList from './ActivityList';

const MyActivitiesPanel = ({
  activities,
  openIndex,
  onToggle,
  onOpenCarpoolModal,
  fetchingCarpools,
  roleColors,
  userId,
  joinedChildrenInCarpool,
  checkIfAllChildrenJoined,
  handleJoinCarpool,
  loadingJoinState,
  handleDeleteCarpool,
  openChatModal,
  translateCarpoolType,
  onCarpoolClick,
}) => (
  <Box p={4} bg="blue.50" borderRadius="lg" shadow="md" borderWidth="0px">
    <Box mb={8} display="flex" alignItems="center">
      <Heading
        as="h2"
        size="md"
        mb={4}
        color="gray.700"
        mt={5}
        fontWeight="bold"
      >
        Mina aktiviteter
      </Heading>
      <Popover>
        <PopoverTrigger>
          <IconButton
            icon={<InfoIcon />}
            aria-label="More Info"
            variant="unstyled"
            fontSize={{ base: 'l' }}
            _hover={{ color: 'gray.700' }}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <Text mb={2}>
              Här kan du se dina bokade samåkningar samt de samåkningar som du har skapat.
            </Text>
            <Text>
              "Mina aktiviteter" visar både resor du ska delta i och de samåkningar där du erbjuder plats för andra.
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>

    <ActivityList
      activities={activities}
      openIndex={openIndex}
      onToggle={onToggle}
      onOpenCarpoolModal={onOpenCarpoolModal}
      fetchingCarpools={fetchingCarpools}
      roleColors={roleColors}
      userId={userId}
      joinedChildrenInCarpool={joinedChildrenInCarpool}
      checkIfAllChildrenJoined={checkIfAllChildrenJoined}
      handleJoinCarpool={handleJoinCarpool}
      loadingJoinState={loadingJoinState}
      handleDeleteCarpool={handleDeleteCarpool}
      openChatModal={openChatModal}
      translateCarpoolType={translateCarpoolType}
      onCarpoolClick={onCarpoolClick}
    />
  </Box>
);

export default MyActivitiesPanel;