import { React, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './utils/UserContext';
import Navbar from './components/Navbar';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Home from './components/Home';
import DashBoardAdmin from './components/DashBoardAdmin';
import DashBoardLeader from './components/DashBoardLeader';
import DashBoardParent from './components/DashBoardParent'; 
import Profile from './components/Profile'; 
import Footer from './components/Footer';
import ResetPassword from './components/ResetPassword';
import { Box } from '@chakra-ui/react';

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

const AppContent = () => {
  const { isInitialized, loading, fetchUserData } = useUser();

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
            <Route path="/FetchUsers" element={<FetchUsers />} />
            <Route path="/TestSession" element={<TestSession />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
};

export default App;
