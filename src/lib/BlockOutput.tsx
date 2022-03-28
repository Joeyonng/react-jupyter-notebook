import React, {useCallback, useState} from "react";
import Ansi from "ansi-to-react";

import {BlockOutputPropsType} from "./types";

function BlockOutput(props:BlockOutputPropsType) {
  const metadata = props.cell['metadata'];
  const outputs = props.cell['outputs']

  const [state, setState] = useState({
    highlighted: false,
    prevDisplay: 1,
    display: 1,
    contentHeight: 0,
  })
  const contentRef = useCallback((node) => {
    if (node) {
      setState(state => ({...state, contentHeight: node.offsetHeight}));
    }
  }, [])

  if (props.display !== state.prevDisplay) {
    let newDisplay = props.display;
    if (newDisplay === -1) {
      if (metadata['collapsed'] || (metadata['jupyter'] !== undefined && metadata['jupyter']['outputs_hidden'])) {
        newDisplay = 0;
      }
      else if (metadata['scrolled']) {
        newDisplay = 2;
      }
    }

    setState({...state, prevDisplay: props.display, display: newDisplay});
  }

  return (
    <div
      className="block-output"
    >
      <div
        className={props.highlighted ? "block-light-selected" : "block-light"}
        onClick={() => {
          setState({...state, display: (state.display + 1) % 3})
        }}
      />
      {state.display === 0 ? <div className="block-hidden"/> :
        <div
          className="block-output-content"
          style={state.display !== 2 ? undefined : {
            maxHeight: state.contentHeight,
            height: 200,
            boxShadow: "inset 0 0 6px 2px rgb(0 0 0 / 30%)",
            resize: "vertical",
          }}
        >
          <div ref={contentRef}>
            {!outputs ? null : outputs.map((output, index) => {
              let executionCount;
              let htmlContent;
              if ('output_type' in output) {
                let output_type = output['output_type'];
                switch (output_type) {
                  // Stdout and stderr
                  case 'stream':
                    htmlContent = (
                      <pre className={`cell-content ${output['name'] === 'stdout' ? 'output-std' : 'output-err'}`}>
                        {!output['text'] ? '' : output['text'].join('')}
                      </pre>
                    )

                    break;
                  // Output with execution_count
                  // @ts-expect-error
                  case 'execute_result':
                    executionCount = output['execution_count']

                  // Output without execution_count
                  case 'display_data':
                    const output_data = output['data'];
                    if (output_data) {
                      if ('image/png' in output_data) {
                        let output_metadata = output['metadata'];
                        let size = output_metadata && output_metadata['image/png'];
                        htmlContent = (
                          <div
                            className="cell-content output-display"
                            style={{
                              justifyContent: props.mediaAlign,
                            }}
                          >
                            <img
                              src={`data:image/png;base64,${output_data['image/png']}`}
                              width={size ? size['width'] : 'auto'}
                              height={size ? size['height'] : 'auto'}
                              alt=""
                            />
                          </div>
                        )
                      }
                      else if ('text/html' in output_data) {
                        htmlContent = (
                          <div
                            className="cell-content output-display"
                            style={{
                              justifyContent: props.mediaAlign,
                            }}
                            dangerouslySetInnerHTML={{__html: output_data['text/html'].join('')}}
                          />
                        )
                      }
                      else if ('text/plain' in output_data) {
                        htmlContent = (
                          <pre className="cell-content output-std">{output_data['text/plain'].join('')}</pre>
                        )
                      }
                    }

                    break;
                  // Exceptions
                  case 'error':
                    htmlContent = (
                      <pre className="cell-content output-err">
                        <Ansi>
                          {!output.traceback ? undefined : output.traceback.join('\n')}
                        </Ansi>
                      </pre>
                    )

                    break;
                  default:
                    console.log('Unexpected output_type: ', output_type);
                }
              }

              return (
                <div
                  key={index}
                  className="cell-row"
                >
                  <pre className="cell-header output">{executionCount ? `[${executionCount}]: ` : null}</pre>
                  {htmlContent}
                </div>
              );
            })}
          </div>
        </div>
      }
    </div>
  )
}

export default BlockOutput;