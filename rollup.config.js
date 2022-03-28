import externals from "rollup-plugin-node-externals";
import typescript from 'rollup-plugin-typescript2';
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

import packageJson from "./package.json";

export default [
  {
    input: "src/lib/JupyterViewer.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      externals(),
      typescript({
        tsconfig: "tsconfig.json",
        tsconfigOverride: {compilerOptions: {declaration: true}},
      }),
      postcss(),
    ],
  },
  {
    input: "dist/JupyterViewer.d.ts",
    output: [{file: packageJson.typeings, format: "es"}],
    external: [/\.scss$/],
    plugins: [dts()],
  },
];