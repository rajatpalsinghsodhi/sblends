import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './customer/App.tsx';
import OwnerDashboard from './owner/OwnerDashboard.tsx';
import PrivacyPolicy from './customer/legal/PrivacyPolicy.tsx';
import TermsOfService from './customer/legal/TermsOfService.tsx';
import CookiePolicy from './customer/legal/CookiePolicy.tsx';
import EmailSMSCompliance from './customer/legal/EmailSMSCompliance.tsx';
import './index.css';

const path = window.location.pathname;

function Root() {
  if (path.startsWith('/owner')) return <OwnerDashboard />;
  if (path === '/privacy-policy') return <PrivacyPolicy />;
  if (path === '/terms-of-service') return <TermsOfService />;
  if (path === '/cookie-policy') return <CookiePolicy />;
  if (path === '/email-sms-compliance') return <EmailSMSCompliance />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
