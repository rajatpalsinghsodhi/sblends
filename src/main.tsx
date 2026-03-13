import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './customer/App.tsx';
import OwnerDashboard from './owner/OwnerDashboard.tsx';
import './index.css';

const isOwnerRoute = window.location.pathname.startsWith('/owner');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isOwnerRoute ? <OwnerDashboard /> : <App />}
  </StrictMode>,
);
