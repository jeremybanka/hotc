/* eslint-disable @typescript-eslint/no-var-requires */
const path = require(`path`)
const nodeExternals = require(`webpack-node-externals`)
const { CleanWebpackPlugin } = require(`clean-webpack-plugin`)
const DotenvWebpackPlugin = require(`dotenv-webpack`)

module.exports = {
  entry: `./src/index.ts`,
  output: {
    filename: `hotc.js`,
    path: path.resolve(__dirname, `dist`),
  },
  target: `node`,
  externals: [nodeExternals()],
  plugins: [
    new DotenvWebpackPlugin(),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: `ts-loader`,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [`.ts`],
    fallback: {
      "path": require.resolve(`path-browserify`),
    },
  },
  mode: `development`,
  devtool: `inline-source-map`,
  devServer: { contentBase: `./dist` },
}
