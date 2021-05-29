import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import Ansi from "ansi-to-react";
import ReactMarkdown from 'react-markdown';
import RemarkMath from "remark-math";
import gfm from 'remark-gfm';
import {InlineMath, BlockMath} from 'react-katex';
import 'katex/dist/katex.min.css';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {vs} from 'react-syntax-highlighter/dist/esm/styles/prism';

import './JupyterViewer.scss';

function BlockSource(props) {
  const metadata = props.cell['metadata'];
  const source = props.cell['source'].join("");
  const type = props.cell['cell_type'];

  const [state, setState] = useState({
    prevDisplay: 1,
    display: 1,
    contentHeight: 0,
  })

  if (props.display !== state.prevDisplay) {
    let newDisplay = props.display;
    if (props.display === -1) {
      if (metadata['jupyter'] !== undefined && metadata['jupyter']['source_hidden']) {
        newDisplay = 0;
      }
    }

    setState({...state, prevDisplay: props.display, display: newDisplay});
  }

  let htmlContent;
  let executionCount;
  if (type === 'code') {
    executionCount = props.cell['execution_count'];
    htmlContent = (
      <SyntaxHighlighter
        language="python"
        style={vs}
        customStyle={{
          margin: "0 0 0 0",
          padding: "5px 0 5px 0",
          flex: "1",
          backgroundColor: "#F5F5F5",
        }}
        showLineNumbers={true}
      >
        {source}
      </SyntaxHighlighter>
    )
  }
  else if (type === 'markdown') {
    // '$$' has to be in a separate new line to be rendered as a block math equation.
    const re = /\n?\s*\$\$\s*\n?/g;
    let newSource = source.replaceAll(re, "\n$$$\n")

    htmlContent = (
      <div className="cell-content source-markdown">
        <ReactMarkdown
          plugins={[RemarkMath, gfm]}
          renderers={{
            inlineMath: ({value}) => <InlineMath math={value} />,
            math: ({value}) => <BlockMath math={value} />
          }}
        >
          {newSource}
        </ReactMarkdown>
      </div>
    )
  }
  else {
    htmlContent = (
      <div>{`Cell Type ${type} not supported...`}</div>
    )
  }

  return (
    <div className="block-source">
      <div
        className={props.highlighted ? "block-light-selected" : "block-light"}
        onClick={() => {
          setState({...state, display: (state.display + 1) % 2})
        }}
      />

      {state.display === 0 ? <div className="block-hidden"/> :
        <div className="cell-row">
          <pre className="cell-header source">{executionCount ? `[${executionCount}]: ` : null}</pre>
          {htmlContent}
        </div>
      }
    </div>
  )
}

function BlockOutput(props) {
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
    if (props.display === -1) {
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
          style={state.display === 2 ? {
            maxHeight: state.contentHeight,
            height: 200,
            boxShadow: "inset 0 0 6px 2px rgb(0 0 0 / 30%)",
            resize: "vertical",
          } : null}
        >
          <div ref={contentRef}>
            {outputs.map((output, index) => {
              let executionCount;
              let htmlContent;
              if ('output_type' in output) {
                let output_type = output['output_type'];
                switch (output_type) {
                  // Stdout and stderr
                  case 'stream':
                    htmlContent = (
                      <pre className={`cell-content ${output['name'] === 'stdout' ? 'output-std' : 'output-err'}`}>
                        {output['text'].join('')}
                      </pre>
                    )

                    break;
                  // Output with execution_count
                  case 'execute_result':
                    executionCount = output['execution_count']

                  // Output without execution_count
                  case 'display_data':
                    let output_data = output['data'];

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

                    break;
                  // Exceptions
                  case 'error':
                    let output_traceback = output['traceback'].join('\n');

                    htmlContent = (
                      <pre className="cell-content output-err"><Ansi>{output_traceback}</Ansi></pre>
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

function JupyterViewer(props) {
  const DISPLAYS = ['hide', 'show', 'scroll'];

  const [state, setState] = useState({
    clickCellIndex: -1,
  })

  return (
    <div
      className="jupyter-viewer"
    >
      {props.rawIpynb['cells'].map((cell, index) => {
        const mediaAlign = {left: 'flex-start', center: 'center', right: 'flex-end'}[props.mediaAlign];
        const highlighted = state.clickCellIndex === index;
        const displaySource = DISPLAYS.indexOf(props.displaySource);
        const displayOutput = DISPLAYS.indexOf(props.displayOutput)

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
                highlighted={highlighted}
                display={displaySource}
              />
            }
            {!('outputs' in cell) ? null :
              <BlockOutput
                cell={cell}
                highlighted={highlighted}
                display={displayOutput}
                mediaAlign={mediaAlign}
              />
            }
          </div>
        )
      })}
    </div>
  )
}

JupyterViewer.defaultProps = {
  mediaAlign: 'center',
  displaySource: 'auto',
  displayOutput: 'auto',
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object.isRequired,
  mediaAlign: PropTypes.oneOf(['left', 'center', 'right']),
  displaySource: PropTypes.oneOf(['auto', 'hide', 'show']),
  displayOutput: PropTypes.oneOf(['auto', 'hide', 'show', 'scroll']),
}

export default JupyterViewer;
