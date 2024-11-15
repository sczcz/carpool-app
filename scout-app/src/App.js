import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './utils/UserContext';
import Navbar from './components/Navbar';
import Header from './components/Header';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Home from './components/Home'; // Importera Home
import DashBoardLeader from './components/DashBoardLeader';
import DashBoardParent from './components/DashBoardParent'; // Importera din nya dashboard
import Profile from './components/Profile'; // Importera din nya profilsida
import Footer from './components/Footer'; // Import the Footer component


function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

const AppContent = () => {
  const { loading } = useUser();

  // Visa en laddningsindikator eller ett tomt utrymme medan vi väntar på att användardata ska laddas
  if (loading) {
    return <div>Loading...</div>; // Eller en mer avancerad loading-komponent
  }

  return (
    <UserProvider>
      <Router>
        <Header /> 
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard-parent" element={<DashBoardParent />} /> {/* Ny rutt för DashBoardParent */}
          <Route path="/dashboard-leader" element={<DashBoardLeader />} />
          <Route path="/FetchUsers" element={<FetchUsers />} />
          <Route path="/TestSession" element={<TestSession />} />
          <Route path="/profile" element={<Profile />} /> {/* Ny rutt för Profile */}
        </Routes>
        <Footer />
      </Router>
    </UserProvider>
  );
};

export default App;
