import React, {useState} from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import ReactMarkdown from "react-markdown";
import RemarkGFM from "remark-gfm";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';

import hljsStyles from "./hljsStyles";
import {BlockSourcePropsType, codeBlockStylesType} from "./types";

function BlockSource(props:BlockSourcePropsType) {
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
    const {hljsStyle, lineNumberStyle, lineNumberContainerStyle, codeContainerStyle} = props.codeBlockStyles
    || {} as codeBlockStylesType;

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
            {!source ? null : source.map((item, index) => index === 0 ? ' ' : '\n').join('')}
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
            {!source ? null : source.join('')}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }
  else if (type === 'markdown') {
    // '$$' has to be in a separate new line to be rendered as a block math equation.
    const re = /\n?\s*\$\$\s*\n?/g;
    const newSource = !source ? '' : source.join('').replaceAll(re, "\n$$$\n")

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

export default BlockSource;