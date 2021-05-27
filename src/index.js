import React from 'react';
import ReactDOM from 'react-dom';

import JupyterViewer from "./lib/JupyterViewer";
import nb_test from "./nb_test.json"; // You need to read .ipynb file into a Json Object.

ReactDOM.render(
  <React.StrictMode>
    <JupyterViewer
      rawIpynb={nb_test}
      mediaAlign="left"
      displaySource="auto"
      displayOutput="auto"
    />
  </React.StrictMode>,
  document.getElementById('root')
);
