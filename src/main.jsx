import React from 'react';
import ReactDOM from 'react-dom';
import ons from 'onsenui';

// Onsen UI Styling and Icons
import 'onsenui/css/onsen-css-components.css';
import 'onsenui/css/onsenui.css';

import App from './App';

if (ons.platform.isIPhoneX()) {
  document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
  document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('app')
);