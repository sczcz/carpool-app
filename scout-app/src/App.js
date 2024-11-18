import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Home from './components/Home'; // Import Home
import DashBoardLeader from './components/DashBoardLeader';
import DashBoardParent from './components/DashBoardParent'; // Import your dashboard
import Profile from './components/Profile'; // Import your profile page
import Footer from './components/Footer'; // Import the Footer component
import { Box } from '@chakra-ui/react';

const App = () => {
  return (
    <Router>
      {/* Flexbox layout for full-height behavior */}
      <Box display="flex" flexDirection="column" minHeight="100vh">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <Box flex="1" as="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard-parent" element={<DashBoardParent />} /> {/* New route for DashBoardParent */}
            <Route path="/dashboard-leader" element={<DashBoardLeader />} />
            <Route path="/FetchUsers" element={<FetchUsers />} />
            <Route path="/TestSession" element={<TestSession />} />
            <Route path="/profile" element={<Profile />} /> {/* New route for Profile */}
          </Routes>
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Router>
  );
};

export default App;
