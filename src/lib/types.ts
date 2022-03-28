import ""
export interface codeBlockStylesType {
  hljsStyle: string,
  lineNumberStyle?: {},
  lineNumberContainerStyle?: {},
  codeContainerStyle?: {},
}

export interface cellOutputType {
  name?: string,
  data?: {[key: string]: any},
  metadata?: {[key: string]: any},
  output_type?: string,
  text?: string[],
  execution_count?: number,
  traceback?: string[],
}

export interface cellType {
  cell_type?: string,
  execution_count?: number,
  metadata: {
    scrolled?: boolean,
    collapsed?: boolean,
    jupyter?: {
      source_hidden?: boolean,
      outputs_hidden?: boolean,
    },
  },
  outputs?: cellOutputType[],
  source?: string[],
}

export interface BlockSourcePropsType {
  cell: cellType,
  language: string,
  display: number,
  highlighted: boolean,
  showLineNumbers: boolean,
  codeBlockStyles?: codeBlockStylesType,
}

export interface BlockOutputPropsType {
  cell: cellType,
  display: number,
  highlighted: boolean,
  mediaAlign: string,
  codeBlockStyles?: codeBlockStylesType,
}

export interface JupyterViewerPropsType {
  rawIpynb: {
    cells: cellType[],
  },
  language?: string,
  showLineNumbers?: boolean,
  mediaAlign?: 'left' | 'center' | 'right',
  displaySource?: 'auto' | 'hide' | 'show',
  displayOutput?: 'auto' | 'hide' | 'show' | 'scroll',
  codeBlockStyles?: codeBlockStylesType,
}