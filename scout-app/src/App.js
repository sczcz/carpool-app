import { React, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './utils/UserContext';
import { CarpoolProvider, useCarpool } from './utils/CarpoolContext';
import Navbar from './components/layout/Navbar';
import Home from './components/views/Home';
import DashBoardAdmin from './components/views/DashBoardAdmin';
import DashBoardLeader from './components/views/DashBoardLeader';
import DashBoardParent from './components/views/DashBoardParent'; 
import CarpoolDetails from './components/carpool/CarpoolDetails';
import CarpoolChat from './components/carpool/CarpoolChat';
import Profile from './components/views/Profile'; 
import Footer from './components/layout/Footer';
import ResetPassword from './components/views/ResetPassword';
import Error404 from './components/views/Error404';
import Error500 from './components/views/Error500';
import Information from './components/views/Information';
import { 
  Box, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader,
  ModalCloseButton,
  ModalBody
} from '@chakra-ui/react';

function App() {
  return (
    <UserProvider>
      <CarpoolProvider>
        <AppContent />
      </CarpoolProvider>
    </UserProvider>
  );
}

const AppContent = () => {
  const { isInitialized, loading, fetchUserData } = useUser();
  const { 
    isDetailsOpen, 
    onDetailsClose, 
    isChatOpen, 
    onChatClose,
    selectedCarpoolId 
  } = useCarpool();

  useEffect(() => {
    if (!isInitialized) {
      fetchUserData(); 
    }
  }, [isInitialized, fetchUserData]);

  if (!isInitialized || loading) {
    return <div>Laddar...</div>;
  }

  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        <Box flex="1" as="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard-parent" element={<DashBoardParent />} />
            <Route path="/dashboard-leader" element={<DashBoardLeader />} />
            <Route path="/dashboard-admin" element={<DashBoardAdmin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/information" element={<Information />} />
            <Route path="/500" element={<Error500 />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Box>
        <Footer />

        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Carpool Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CarpoolDetails />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isChatOpen && selectedCarpoolId !== null} onClose={onChatClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Samåkning - Chatt</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CarpoolChat carpoolId={selectedCarpoolId} />
            </ModalBody>
          </ModalContent>
        </Modal>

      </Box>
    </Router>
  );
};

export default App;
