/* eslint-disable no-undef */
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import nodePolyfills from "rollup-plugin-node-polyfills";

const extensions = [".js", ".ts"];
const cjs_external = [
  /@babel\/runtime/,
  "tweetnacl",
  "@nekoproject/wallets",
  "@ethersproject/units",
  "@solana/web3.js",
  "@solana/spl-token",
  "@metaplex-foundation/mpl-token-metadata",
  "web3",
  "ethers",
  "dotenv",
  "loglevel",
];
//
function initConfig(type, format) {
  const browser = type === "browser";
  const bundle = format === "iife";

  // base config
  let config = {
    input: "src/index.ts",
    plugins: [
      commonjs(),
      nodePolyfills(),
      nodeResolve({
        browser: browser,
        dedupe: ["bn.js", "buffer"],
        extensions,
        preferBuiltins: !browser,
      }),
      babel({
        exclude: "./node_modules/**",
        extensions,
        babelHelpers: bundle ? "bundled" : "runtime",
        plugins: bundle ? [] : ["@babel/plugin-transform-runtime"],
      }),
      replace({
        preventAssignment: true,
      }),
      json(),
    ],
    onwarn: function (warning, rollupWarn) {
      if (warning.code !== "CIRCULAR_DEPENDENCY") {
        rollupWarn(warning);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
    context: "window",
  };

  // browser config
  if (type == "browser") {
    if (format === "umd") {
      config.output = [
        {
          file: "lib/index.umd.js",
          format: "umd",
          name: "network",
          sourcemap: true,
        },
        {
          file: "lib/index.umd.min.js",
          format: "umd",
          name: "network",
          sourcemap: true,
          plugins: [terser({ mangle: false, compress: false })],
        },
      ];
    } else {
      throw new Error(`Unknown format: ${format}`);
    }
  }
  // node config
  else if (type == "node") {
    // Bundling Node Module ...
    config.external = cjs_external;
    config.output = [
      {
        file: "./lib/index.commonjs.js",
        format: "cjs",
        sourcemap: true,
      },
    ];
  }
  return config;
}

export default [initConfig("node"), initConfig("browser", "umd")];
