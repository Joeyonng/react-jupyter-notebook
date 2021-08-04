import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import Ansi from "ansi-to-react";
import ReactMarkdown from 'react-markdown';
import RemarkGFM from "remark-gfm";
import RemarkMath from "remark-math";
import RehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css';
import SyntaxHighlighter from 'react-syntax-highlighter';

import './JupyterViewer.scss';
import hljsStyles from './hljsStyles'


function BlockSource(props) {
  const metadata = props.cell['metadata'];
  const source = props.cell['source'];
  const type = props.cell['cell_type'];

  const [state, setState] = useState({
    prevDisplay: 1,
    display: 1,
    contentHeight: 0,
  })

  if (props.display !== state.prevDisplay) {
    let newDisplay = props.display;
    if (newDisplay === -1) {
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

    // SyntaxHighlighter originally doesn't separate the line numbers and the codes.
    // The first SyntaxHighlighter is used to show line numbers only and the second is to show codes only.
    const {hljsStyle, lineNumberContainerStyle, lineNumberStyle, codeContainerStyle} = props.codeBlockStyles ?
      props.codeBlockStyles : {};
    htmlContent = (
      <div className="cell-content source-code">
        {!props.showLineNumbers ? null :
          <SyntaxHighlighter
            language={props.language}
            style={hljsStyle ? hljsStyles[hljsStyle] : hljsStyles.vs}
            codeTagProps={{
              style: {
                fontFamily: "Menlo, Consolas, 'DejaVu Sans Mono', monospace",
                fontSize: "13px",
              }
            }}
            customStyle={hljsStyle ? lineNumberContainerStyle : {
              width: "37px",
              margin: "0 0 0 0",
              padding: "5px 0 5px 0",
              boxSizing: "border-box",
              background: "#EEEEEE",
              border: "solid 1px #E0E0E0",
              overflow: "hidden",
            }}
            showLineNumbers={true}
            lineNumberStyle={hljsStyle ? lineNumberStyle : {
              width: "37px",
              padding: "0 8px 0 8px",
              boxSizing: "border-box",
              color: "#999999",
            }}
          >
            {source.map((item, index) => index === 0 ? ' ' : '\n').join('')}
          </SyntaxHighlighter>
        }

        <div className="source-code-main">
          <SyntaxHighlighter
            language={props.language}
            style={hljsStyle ? hljsStyles[hljsStyle] : hljsStyles.vs}
            codeTagProps={{
              style: {
                fontFamily: "Menlo, Consolas, 'DejaVu Sans Mono', monospace",
                fontSize: "13px",
              }
            }}
            customStyle={hljsStyle ? codeContainerStyle : {
              margin: "0 0 0 0",
              padding: "5px 4px 5px 4px",
              boxSizing: "border-box",
              background: "#F5F5F5",
              border: "solid 1px #E0E0E0",
              flex: 1,
            }}
          >
            {source.join('')}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }
  else if (type === 'markdown') {
    // '$$' has to be in a separate new line to be rendered as a block math equation.
    const re = /\n?\s*\$\$\s*\n?/g;
    let newSource = source.join('').replaceAll(re, "\n$$$\n")

    htmlContent = (
      <div className="cell-content source-markdown">
        <ReactMarkdown
          remarkPlugins={[RemarkGFM, RemarkMath]}
          rehypePlugins={[RehypeKatex]}
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
  // -1: auto, 0: hide, 1: show, 2: scroll
  const DISPLAYS = ['hide', 'show', 'scroll'];

  const [state, setState] = useState({
    clickCellIndex: -1,
  })

  return (
    <div
      className="jupyter-viewer"
    >
      {props.rawIpynb['cells'].map((cell, index) => {
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
                language={props.language}
                highlighted={state.clickCellIndex === index}
                display={DISPLAYS.indexOf(props.displaySource)}
                showLineNumbers={props.showLineNumbers}
                codeBlockStyles={props.codeBlockStyles}
              />
            }
            {!('outputs' in cell) ? null :
              <BlockOutput
                cell={cell}
                highlighted={state.clickCellIndex === index}
                display={DISPLAYS.indexOf(props.displayOutput)}
                mediaAlign={{left: 'flex-start', center: 'center', right: 'flex-end'}[props.mediaAlign]}
              />
            }
          </div>
        )
      })}
    </div>
  )
}

JupyterViewer.defaultProps = {
  language: 'python',
  showLineNumbers: true,
  mediaAlign: 'center',
  displaySource: 'auto',
  displayOutput: 'auto',
  codeBlockStyles: undefined,
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object.isRequired,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  mediaAlign: PropTypes.oneOf(['left', 'center', 'right']),
  displaySource: PropTypes.oneOf(['auto', 'hide', 'show']),
  displayOutput: PropTypes.oneOf(['auto', 'hide', 'show', 'scroll']),
  codeBlockStyles:  PropTypes.shape({
    hljsStyle: PropTypes.oneOf(Object.keys(hljsStyles)),
    lineNumberContainerStyle: PropTypes.object,
    lineNumberStyle: PropTypes.object,
    codeContainerStyle: PropTypes.object,
  }),
}

export default JupyterViewer;
