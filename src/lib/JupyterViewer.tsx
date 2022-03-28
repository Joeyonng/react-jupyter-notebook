import React, {useState} from 'react';

import BlockSource from "./BlockSource";
import BlockOutput from "./BlockOutput";

import './JupyterViewer.scss';
import {JupyterViewerPropsType} from "./types";

// -1: auto, 0: hide, 1: show, 2: scroll
const DISPLAYS = ['hide', 'show', 'scroll'];

function JupyterViewer(props:JupyterViewerPropsType) {
  const {
    rawIpynb,
    language='python',
    showLineNumbers=true,
    mediaAlign='center',
    displaySource='auto',
    displayOutput='auto',
    codeBlockStyles=undefined,
  } = props;

  const [state, setState] = useState({
    clickCellIndex: -1,
  })

  return (
    <div className="jupyter-viewer">
      {rawIpynb['cells'].map((cell, index) => {
        return (
          <div
            key={index}
            className="block"
            onMouseDown={() => {
              setState({...state, clickCellIndex: index})
            }}
          >
            {!('cell_type' in cell) ? null :
              <BlockSource
                cell={cell}
                language={language}
                highlighted={state.clickCellIndex === index}
                display={DISPLAYS.indexOf(displaySource)}
                showLineNumbers={showLineNumbers}
                codeBlockStyles={codeBlockStyles}
              />
            }
            {!('outputs' in cell) ? null :
              <BlockOutput
                cell={cell}
                highlighted={state.clickCellIndex === index}
                display={DISPLAYS.indexOf(displayOutput)}
                mediaAlign={{left: 'flex-start', center: 'center', right: 'flex-end'}[mediaAlign]}
              />
            }
          </div>
        )
      })}
    </div>
  )
}

export default JupyterViewer;