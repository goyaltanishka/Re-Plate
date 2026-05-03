import '@fortawesome/fontawesome-free/css/all.min.css';
import './src/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import BrowserPodDemo from './components/BrowserPodDemo';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element');

const root = ReactDOM.createRoot(rootElement);

const isInsidePod = window.location.search.includes('pod=true');

root.render(
  <React.StrictMode>
    {isInsidePod ? <App /> : <BrowserPodDemo />}
  </React.StrictMode>
);