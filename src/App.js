import React, {useState} from 'react';
import nb_test from "./nb_test.json"

import JupyterViewer from "./lib/JupyterViewer";

function App(props) {
  const [state, setState] = useState({
    rawIpynb: nb_test,
    mediaAlign: "left",
    displaySource: "auto",
    displayOutput: "auto",
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
      </div>

      {!state.rawIpynb ? null :
        <JupyterViewer
          rawIpynb={state.rawIpynb}
          mediaAlign={state.mediaAlign}
          displaySource={state.displaySource}
          displayOutput={state.displayOutput}
        />
      }
    </React.Fragment>
  )
}

export default App;