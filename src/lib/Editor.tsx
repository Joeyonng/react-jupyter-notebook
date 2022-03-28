import React, {useEffect, useRef, useState} from "react";
import {EditorState, StateEffect} from '@codemirror/state';
import {EditorView, keymap, ViewUpdate, placeholder} from '@codemirror/view';
import {lineNumbers} from "@codemirror/gutter";
import {javascript} from "@codemirror/lang-javascript"

declare interface EditorPropsType {
  editable: boolean,
  onChange: (change: string) => void,
}

function Editor(props: EditorPropsType) {
  const {
    editable=true,
    onChange=(value) => console.log(value),
  } = props;

  const [state, setState] = useState<{[key:string]: any}>({});

  const extensions = [
    javascript(),
    lineNumbers(),
    // onChange listener
    EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
      if (viewUpdate.docChanged && typeof onChange === 'function') {
        const doc = viewUpdate.state.doc;
        const value = doc.toString();
        onChange(value);
      }
    }),
    // Jupyter theme
    EditorView.theme(
      {
        '&.cm-editor': {
          border: "1px solid rgb(224, 224, 224)",
          backgroundColor: "rgb(245, 245, 245)",
        },
        '&.cm-editor.cm-focused': {
          outline: "1px solid #1976d2",
        },
        '.cm-gutters': {
          minWidth: "37px",
          display: "initial",
          backgroundColor: "rgb(238, 238, 238)"
        }
      },
      {dark: false},
    ),
    // Editable
    EditorView.editable.of(editable),
  ];

  const codeMirrorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (codeMirrorRef.current && !state.view) {
      const view = new EditorView({
        state: EditorState.create({
          extensions: extensions,
          doc: "TEST",
        }),
        parent: codeMirrorRef.current,
      })
      setState((state) => ({...state, view}))
    }
  }, [codeMirrorRef.current])

  return (
    <div ref={codeMirrorRef}/>
  )
}

export default Editor;