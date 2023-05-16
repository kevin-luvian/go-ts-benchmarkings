const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
// const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const frontend_path = path.resolve(__dirname, "./");

module.exports = {
  entry: path.join(frontend_path, "src", "index.js"),
  output: {
    path: path.resolve(frontend_path, "public"),
    filename: "index.bundle.js",
  },
  devServer: {
    static: path.resolve(frontend_path, "public"),
    port: 3000,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(frontend_path, "public", "index.html"),
      filename: "index.html",
    }),
    // new WasmPackPlugin({
    //   crateDirectory: path.resolve(__dirname, "."),
    // }),
    new webpack.ProvidePlugin({
      TextDecoder: ["text-encoding", "TextDecoder"],
      TextEncoder: ["text-encoding", "TextEncoder"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  mode: "development",
  // mode: "production",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  // experiments: {
  //   asyncWebAssembly: true,
  // },
  resolve: {
    extensions: [".js", ".jsx", ".scss", ".wasm"],
  },
};
