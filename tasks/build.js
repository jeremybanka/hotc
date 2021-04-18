/* eslint import/no-extraneous-dependencies: off */
import { rollup } from "rollup"
import { babel } from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import rollupCommonJS from "@rollup/plugin-commonjs"
import { minify as _minify } from "uglify-js"
import { readFileSync, writeFileSync } from "fs"

// For some reason, the minifier is currently producing
// total giberrish, at least for the global build.
// I've disabled it for now, and will simply uglify externally.
const TRUST_MINIFY = false

function rollupInputOpts(opts) {
  const presetOpts = {
    modules: false,
    loose: true,
  }

  if (opts.target) {
    presetOpts.targets = opts.target
  }

  const inputOpts = {
    input: opts.src || `./src/topdeck.js`,
    onwarn: warning => {
      // I don't care about these for now
      if (warning.code !== `CIRCULAR_DEPENDENCY`) {
        console.warn(`(!) ${warning.message}`)
      }
    },

    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: `node_modules/**`,
      }),
    ],
  }

  if (opts.compile || typeof opts.compile === `undefined`) {
    inputOpts.plugins.push(
      babel({
        babelrc: true,
        presets: [[`@babel/preset-env`, presetOpts]],
        babelHelpers: `bundled`,
      })
    )
  }

  return inputOpts
}

function rollupOutputOpts(dest, opts) {
  const outputOpts = {
    file: `build/${dest}/${opts.filename || `topdeck.js`}`,
    format: opts.format,
    sourcemap: true,
  }

  if (opts.name) {
    outputOpts.name = opts.name
  }

  return outputOpts
}

async function babelAndRollup(dest, opts) {
  const inputOpts = rollupInputOpts(opts)
  const outputOpts = rollupOutputOpts(dest, opts)
  const bundle = await rollup(inputOpts)
  await bundle.write(outputOpts)
}

async function buildLibrary(dest, opts) {
  console.log(`Building`, dest)
  const promises = [babelAndRollup(dest, opts)]

  if (opts.minify && TRUST_MINIFY) {
    promises.push(
      babelAndRollup(dest, { ...opts, minify: true, filename: `topdeck.min.js` })
    )
  }

  await Promise.all(promises)

  if (opts.minify && !TRUST_MINIFY) {
    const code = readFileSync(`build/${dest}/topdeck.js`, `utf8`)
    const ugly = _minify(code, {
      toplevel: !opts.global,
      output: {
        comments: false,
      },
      sourceMap: {
        filename: `build/${dest}/topdeck.js`,
      },
    })
    if (ugly.error) {
      console.error(`Error uglifying`, ugly.error)
    } else {
      writeFileSync(`build/${dest}/topdeck.min.js`, ugly.code)
      writeFileSync(`build/${dest}/topdeck.min.js.map`, ugly.map)
    }
  }
  console.log(`Built`, dest)
}

const browsersOld = `last 2 major versions`

async function global() {
  await buildLibrary(`global`, {
    format: `iife`,
    global: true,
    name: `topdeck`,
    target: browsersOld,
    minify: true,
  })
}

async function globalFilled() {
  await buildLibrary(`global-filled`, {
    format: `iife`,
    global: true,
    name: `topdeck`,
    target: browsersOld,
    src: `./src/topdeck.js`,
    minify: true,
  })
}

async function amd() {
  await buildLibrary(`amd`, {
    format: `amd`,
    name: `topdeck`,
    target: browsersOld,
    minify: true,
  })
}

async function amdFilled() {
  await buildLibrary(`amd-filled`, {
    format: `amd`,
    name: `topdeck`,
    target: browsersOld,
    src: `./src/topdeck.js`,
    minify: true,
  })
}

async function node() {
  await buildLibrary(`node`, { format: `cjs`, target: `node 6` })
}

async function cjsBrowser() {
  await buildLibrary(`cjs-browser`, { format: `cjs`, target: browsersOld })
}

async function es6() {
  await buildLibrary(`es6`, {
    format: `es`,
    compile: false,
  })
}

async function globalEs6() {
  await buildLibrary(`global-es6`, {
    format: `iife`,
    name: `topdeck`,
    compile: false,
    global: true,
  })
}

async function buildAll() {
  await Promise.all([
    node(),
    cjsBrowser(),
    es6(),
    amd(),
    amdFilled(),
    global(),
    globalEs6(),
    globalFilled(),
  ])
}

export { buildAll, node as buildNode, global as buildGlobal }
