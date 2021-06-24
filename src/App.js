import React, {useState} from 'react';
import nb_test from "./nb_test.json"

import JupyterViewer from "./lib/JupyterViewer";
import hljsStyles from "./lib/hljsStyles";


function App(props) {
  const [state, setState] = useState({
    rawIpynb: nb_test,
    mediaAlign: "left",
    displaySource: "auto",
    displayOutput: "auto",
    showLineNumbers: true,
    codeBlockStyles: undefined,
  })

  return (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <input
          name="rawIpynb"
          type="file"
          onChange={e => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.readAsText(e.target.files[0], "UTF-8");
              reader.onload = (e) => {
                setState({...state, rawIpynb: JSON.parse(e.target.result)})
              };
              reader.onerror = (e) => {
                console.log('reader error!', e)
              };
            }
          }}
        />
        <div>
          <label htmlFor="mediaAlign">mediaAlign</label>
          <select
            name="mediaAlign"
            onChange={e => {
              setState({...state, mediaAlign: e.target.value})
            }}
          >
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </div>
        <div>
          <label htmlFor="displaySource">displaySource</label>
          <select
            name="displaySource"
            onChange={e => {
              setState({...state, displaySource: e.target.value})
            }}
          >
            <option value="auto">auto</option>
            <option value="hide">hide</option>
            <option value="show">show</option>
          </select>
        </div>
        <div>
          <label htmlFor="displayOutput">displayOutput</label>
          <select
            name="displayOutput"
            onChange={e => {
              setState({...state, displayOutput: e.target.value})
            }}
          >
            <option value="auto">auto</option>
            <option value="hide">hide</option>
            <option value="show">show</option>
            <option value="scroll">scroll</option>
          </select>
        </div>
        <div>
          <label htmlFor="showLineNumbers">showLineNumbers</label>
          <select
            name="showLineNumbers"
            onChange={e => {
              setState({...state, showLineNumbers: e.target.value === 'show'})
            }}
          >
            <option value="show">show</option>
            <option value="hide">hide</option>
          </select>
        </div>
        <div>
          <label htmlFor="hljsStyle">hljsStyle</label>
          <select
            name="hljsStyle"
            onChange={e => {
              setState({
                ...state,
                codeBlockStyles: e.target.value === 'default' ? undefined : {
                  hljsStyle: e.target.value,
                }
              })
            }}
          >
            <option key="default" value="default">DEFAULT</option>
            {Object.keys(hljsStyles).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {!state.rawIpynb ? null :
        <JupyterViewer
          rawIpynb={state.rawIpynb}
          mediaAlign={state.mediaAlign}
          showLineNumbers={state.showLineNumbers}
          displaySource={state.displaySource}
          displayOutput={state.displayOutput}
          codeBlockStyles={state.codeBlockStyles}
        />
      }
    </React.Fragment>
  )
}

export default App;