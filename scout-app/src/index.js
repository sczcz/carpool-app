import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react'; // Importera ChakraProvider
import customTheme from './Theme'; // Importera ditt tema från Theme.js i src-mappen
import '@fontsource/playfair-display/400.css'; // Playfair Display Regular


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme}>  {/* Använd ditt anpassade tema */}
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
