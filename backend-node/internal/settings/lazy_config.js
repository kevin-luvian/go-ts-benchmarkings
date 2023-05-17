const path = require("path");
const fs = require("fs");

const getFEPublicDir = () => {
  return path.resolve(__dirname, "../../../frontend/public");
};

const getTestDir = () => {
  return path.resolve(__dirname, "../../../tests");
};

const readConfigJson = () => {
  const configPath = path.join(getFEPublicDir(), "DBConfig.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  return config;
};

module.exports = {
  getTestDir,
  readConfigJson,
};
