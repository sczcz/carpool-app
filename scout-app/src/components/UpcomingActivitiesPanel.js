import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  SimpleGrid,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import ActivityCard from './ActivityCard';
import CarpoolList from './CarpoolList';
import AddChildModal from './AddChildModal';

const UpcomingActivitiesPanel = ({
  activities,
  activitiesForUpcoming,
  visibleActivitiesCount,
  openCarpoolIndex,
  toggleCarpool,
  roleColors,
  openCarpoolModal,
  fetchingCarpools,
  userId,
  joinedChildrenInCarpool,
  checkIfAllChildrenJoined,
  onJoinCarpool,
  loadingJoinState,
  onDeleteCarpool,
  openChatModal,
  onCarpoolClick,
  translateCarpoolType,
  handleLoadMore,
  isAddChildOpen,
  openAddChildModal,
  closeAddChildModal,
  handleChildAdded,
}) => (
  <Box mb={8}>
    <Box mb={8} display="flex" alignItems="center">
      <Heading
        as="h2"
        size="md"
        mb={4}
        color="gray.700"
        mt={5}
        fontWeight="bold"
      >
        Kommande aktiviteter
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
            Här kan du se detaljerad information om kommande aktiviteter och hur du kan boka.
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>

    {activities.length === 0 && (
      <VStack spacing={4}>
        <Box mb={8} display="flex" alignItems="center">
          <Text fontSize="lg" color="gray.500">
            Inga aktiviteter hittades. Lägg till barn
          </Text>
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
                För att se dina barns aktiviteter måste du först lägga till dem. För att boka in dig själv, klicka på 'Visa alla aktiviteter'.
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
        <Button size="sm" rightIcon={<InfoIcon />} colorScheme="brand" onClick={openAddChildModal}>
          Lägg till barn
        </Button>
      </VStack>
    )}

    <AddChildModal
      isOpen={isAddChildOpen}
      onClose={closeAddChildModal}
      onChildAdded={handleChildAdded}
    />

    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
      {activitiesForUpcoming.slice(0, visibleActivitiesCount).map((activity, index) => (
        <ActivityCard
          key={activity.activity_id}
          activity={activity}
          index={index}
          isOpen={openCarpoolIndex === index}
          onToggle={toggleCarpool}
          roleColors={roleColors}
        >
          <CarpoolList
            activity={activity}
            carpools={activity.carpools}
            fetchingCarpools={fetchingCarpools}
            onOpenCarpoolModal={openCarpoolModal}
            userId={userId}
            joinedChildrenInCarpool={joinedChildrenInCarpool}
            checkIfAllChildrenJoined={checkIfAllChildrenJoined}
            onJoinCarpool={onJoinCarpool}
            loadingJoinState={loadingJoinState}
            onDeleteCarpool={onDeleteCarpool}
            onOpenChat={openChatModal}
            onCarpoolClick={onCarpoolClick}
            translateCarpoolType={translateCarpoolType}
          />
        </ActivityCard>
      ))}
    </SimpleGrid>

    <Button mt={4} onClick={handleLoadMore} colorScheme="teal">
      Ladda fler ↓
    </Button>
  </Box>
);

export default UpcomingActivitiesPanel;