// rollup.config.mjs
export default {
  input: 'savior.js',
  output: {
    file: 'dist/savior.umd.js',
    format: 'umd',
    name: 'Savior',
    sourcemap: true,
  },
};
