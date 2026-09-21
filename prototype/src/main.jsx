import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainApp } from './App';
import { MockStoreProvider } from './store/mockStore';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MockStoreProvider>
      <MainApp />
    </MockStoreProvider>
  </React.StrictMode>
);
