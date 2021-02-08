import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import MenuContextProvider from './context/MenuContext';

const app = (
  <MenuContextProvider>
    <App />
  </MenuContextProvider>
);

ReactDOM.render(app, document.getElementById('root'));
