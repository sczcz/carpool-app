import { createContext, useContext, useState } from 'react';
import { useToast } from '@chakra-ui/react';

const CarpoolContext = createContext();

export const CarpoolProvider = ({ children }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedCarpool, setSelectedCarpool] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCarpoolId, setSelectedCarpoolId] = useState(null);
  const toast = useToast();

  const onDetailsOpen = () => setIsDetailsOpen(true);
  const onDetailsClose = () => setIsDetailsOpen(false);

  const openChat = (carpoolId) => {
    setSelectedCarpoolId(carpoolId);
    setIsChatOpen(true);
  };
  
  const closeChat = () => {
    setSelectedCarpoolId(null);
    setIsChatOpen(false);
  };

  const fetchCarpoolsForActivity = async (activityId) => {
    setFetchingCarpools(true);
    try {
      const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setActivities((prevActivities) =>
          prevActivities.map((activity) => {
            if (activity.activity_id === activityId) {
              return {
                ...activity,
                carpools: data.carpools.map((carpool) => ({
                  ...carpool,
                  passengers: carpool.passengers.map((passenger) => {
                    if (passenger.type === 'child') {
                      // Hantera om passageraren är ett barn
                      return {
                        ...passenger,
                        parents: passenger.parents.map((parent) => ({
                          parent_name: parent.parent_name,
                          parent_phone: parent.parent_phone,
                        })),
                        car: carpool.car,
                      };
                    } else if (passenger.type === 'user') {
                      // Hantera om passageraren är en användare
                      return {
                        ...passenger,
                        parents: [], // Ingen "parents" för användare
                        car: carpool.car,
                      };
                    }
                    return passenger;
                  }),
                })),
              };
            }
            return activity;
          })
        );
      } else {
        throw new Error('Misslyckades med att hämta samåkningar');
      }
    } catch (error) {
      toast({
        title: 'Fel vid hämtning av samåkningar.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingCarpools(false);
    }
  };

  return (
    <CarpoolContext.Provider
      value={{
        selectedActivity,
        setSelectedActivity,
        selectedCarpool,
        setSelectedCarpool,
        isDetailsOpen,
        onDetailsOpen,
        onDetailsClose,
        activities,
        setActivities,
        fetchCarpoolsForActivity,
        fetchingCarpools,
        isChatOpen,
        onChatClose: closeChat,
        openChat,
        selectedCarpoolId,
        setSelectedCarpoolId
      }}
    >
      {children}
    </CarpoolContext.Provider>
  );
};

export const useCarpool = () => useContext(CarpoolContext);
