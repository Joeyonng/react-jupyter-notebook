# react-jupyter-notebook

A simple React component that renders .ipynb files just like how they are rendered by JupyterLab.

Demo: https://joeyonng.github.io/react-jupyter-notebook/

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
* [X] Nearly identical looking to original JupyterLab interface.
* [X] Can render codes, images, outputs, markdown(equations) and HTML in the notebook.
* [X] Enable resizing the height of the scrolled output. 
* [X] Can change the alignment of the media outputs.
* [X] Customisable code block styling.

### Usage
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import JupyterViewer from "react-jupyter-notebook";
import nb_test from "./nb_test.json"; // You need to read the .ipynb file into a JSON Object.

ReactDOM.render(
  <React.StrictMode>
    <JupyterViewer rawIpynb={nb_test}/>
  </React.StrictMode>,
  document.getElementById('root')
);
```

### Props
| Prop name       | Type    | Description                                                     | (*default*) Values                 |
|-----------------|---------|-----------------------------------------------------------------|------------------------------------|
| rawIpynb        | Object  | The JSON object converted from the .ipynb file.                 |                                    |
| language        | String  | The programming language used in the notebook.                  | *"python"*, [others][language]     |
| showLineNumbers | Boolean | Show or hide the line numbers.                                  | *true*, false                      |
| mediaAlign      | String  | How to align medias (images, HTML).                             | *"center"*, "left", "right"        |
| displaySource   | String  | How source cells are displayed.                                 | *"auto"*, "hide", "show"           |
| displayOutput   | String  | How output cells are displayed.                                 | *"auto"*, "hide", "show", "scroll" |
| codeBlockStyles | Object  | Customize code cells styles. Use JupyterLab theme if undefined. | *undefined*, {...}                 |

### Customising code block styles (codeBlockStyles prop)
I use [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for the syntax 
highlighting. One little problem with React Syntax Highlighter is that the whole line number container cannot be 
separately styled. The line number part in the original JupyterLab theme has a different background color with the codes 
part, so they need to be separately styled. My solution is to use two `<SyntaxHighlighter/>` components: one displays line 
numbers, and the other displays codes themselves. 

You can use codeBlockStyles prop to pass the props to the SyntaxHighlighter to customize your own code block styles.
Please read the docs of React Syntax Highlighter if you want to use this prop. 

| Property Name            | Type   | Description                                              | Which `<SyntaxHighlighter/>` |
|--------------------------|--------|----------------------------------------------------------|------------------------------|
| hljsStyle                | String | Name of the highlight.js style object. See [here][hljs]. | Both line number and code.   |
| lineNumberStyle          | Object | Style object for every line numbers object.              | Line number.                 |
| lineNumberContainerStyle | Object | Style object for the container of line numbers.          | Line number.                 |
| codeContainerStyle       | Object | Style object for the container of the codes.             | Code.                        |

[language]: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD
[hljs]: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_HLJS.MD

