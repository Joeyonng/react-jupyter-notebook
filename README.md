# react-jupyter-notebook

---
A simple React component that renders .ipynb files just like how they are rendered by JupyterLab.


### Why
I created this component because I want to embed a pure frontend jupyter notebooks (ipynb files) viewer into my personal
website, which is built using React. 

This project was inspired by [React-Jupyter-Viewer](https://github.com/ShivBhosale/React-Jupyter-Viewer). I still 
reinvented the wheel since I prefer the original looking of JupyterLab.

### Install
```bash
npm install --save react-jupyter-notebook
```

### Features
* [X] Have nearly identical looking to original JupyterLab interface.
* [X] Can render codes, images, outputs, markdown(equations) and HTML in the notebook flawlessly.
* [X] Enable resizing the height of the scrolled output. 
* [X] Can change the alignment of the media outputs.

### Usage
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import JupyterViewer from "react-jupyter-notebook";
import nb_test from "./nb_test.json"; // You need to read the .ipynb file into a JSON Object.

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
```

### Props
Prop name | Description | Possible (*default*) Values
--- | --- | --- 
rawIpynb | The JSON object converted from the .ipynb file | 
mediaAlign | How to align medias (Images, HTML) | *"center"*, "left", "right"
displaySource | Whether source cells are always displayed | *"auto"*, "always"
displayOutput | Whether output cells are always displayed | *"auto"*, "always"
