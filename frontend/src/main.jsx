import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { UserProvider } from './context/UserContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
