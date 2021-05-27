import React, {useRef, useState} from 'react';
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

function BlockSource(cell, highlighted, alwaysDisplay) {
  const metadata = cell['metadata'];
  const source = cell['source'].join("");
  const type = cell['cell_type'];

  let htmlContent;
  let executionCount;
  if (type === 'code') {
    executionCount = cell['execution_count'];
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
        className="block-light"
        style={{
          visibility: highlighted ? 'visible' : 'hidden',
        }}
      />

      {!alwaysDisplay && metadata['jupyter'] !== undefined && metadata['jupyter']['source_hidden'] ?
        <div className="block-hidden"/> :
        <div className="cell-row">
          <pre className="cell-header source">{executionCount ? `[${executionCount}]: ` : null}</pre>
          {htmlContent}
        </div>
      }
    </div>
  )
}

function BlockOutput(cell, mediaAlign, highlighted, alwaysDisplay) {
  const ref = useRef(null);

  if (ref.current) {
    console.log(ref.current.offsetHeight);
  }

  const metadata = cell['metadata'];
  const outputs = cell['outputs']
  return (
    <div className="block-output">
      <div
        className="block-light"
        style={{
          visibility: highlighted ? 'visible' : 'hidden',
        }}
      />
      {(!alwaysDisplay && (metadata['collapsed'] ||
        (metadata['jupyter'] !== undefined && metadata['jupyter']['outputs_hidden']))) ?
        <div className="block-hidden"/> :
        <div
          ref={ref}
          className="block-output-content"
          style={{
            height: alwaysDisplay || !metadata['scrolled'] ? "fit-content" : "200px",
            boxShadow: alwaysDisplay || !metadata['scrolled'] ? "initial" : "inset 0 0 6px 2px rgb(0 0 0 / 30%)",
            overflowY: alwaysDisplay || !metadata['scrolled'] ? "hidden" : "auto",
            resize: alwaysDisplay || !metadata['scrolled'] ? "none" : "vertical",
          }}
        >
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
                          justifyContent: mediaAlign,
                        }}
                      >
                        <img
                          src={`data:image/png;base64,${output_data['image/png']}`}
                          width={size ? size['width'] : 'auto'}
                          height={size ? size['height'] : 'auto'}
                        />
                      </div>
                    )
                  }
                  else if ('text/html' in output_data) {
                    htmlContent = (
                      <div
                        className="cell-content output-display"
                        style={{
                          justifyContent: mediaAlign,
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
      }
    </div>
  )
}

function JupyterViewer(props) {
  const [state, setState] = useState({
    hoverCellIndex: -1,
  })

  return (
    <div
      className="jupyter-viewer"
    >
      {props.rawIpynb['cells'].map((cell, index) => {
        const mediaAlign = {left: 'flex-start', center: 'center', right: 'flex-end'}[props.mediaAlign];
        const alwaysDisplaySource = props.displaySource === 'always';
        const alwaysDisplayOutput = props.displayOutput === 'always';
        const highlighted = state.hoverCellIndex === index;

        return (
          <div
            key={index}
            className="block"
            onClick={() => {
              setState({...state, hoverCellIndex: index})
            }}
          >
            {'cell_type' in cell ? BlockSource(cell, highlighted, alwaysDisplaySource) : null}
            {'outputs' in cell ? BlockOutput(cell, mediaAlign, highlighted, alwaysDisplayOutput) : null}
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
  displaySource: PropTypes.oneOf(['auto', 'always']),
  displayOutput: PropTypes.oneOf(['auto', 'always']),
}

export default JupyterViewer;
