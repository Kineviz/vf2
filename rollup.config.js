import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import typescript from '@rollup/plugin-typescript'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'
const env = process.env.NODE_ENV
const extensions = ['.js','.ts'];

const config = {
  input: './src/index.ts',
  external: [],
  output: { 
    format: 'umd',
    file: pkg.main,
    name: 'VF2', // global value window.VF2
    globals: {
    }
  },
  plugins: [
    typescript(),
    nodeResolve({extensions}),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    commonjs()
  ]
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config