const settings = require("./settings");
const lconfig = require("./lazy_config");

module.exports = { ...settings, ...lconfig };
