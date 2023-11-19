import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import { store, persistor } from './store'; // Make sure to import persistor
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = (Component) => (
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

if (!window.ethereum) {
  root.render(
    renderApp(() => (
      <div>You need to install a browser wallet to build the escrow dapp</div>
    ))
  );
} else {
  root.render(renderApp(App));
}
