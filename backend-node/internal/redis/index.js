const redis = require("redis");

let client;

const setup = async ({ host, port, username, password }) => {
  return new Promise(async (resolve, reject) => {
    client = redis.createClient({ socket: { host, port }, username, password });
    client.on("error", (err) => console.log("Redis Server Error", err));
    await client.connect();
    await client.ping();
    console.log("Redis Connected!!");

    resolve();
  });
};

/**
 * @param {string} key
 * @param {string} value
 */
const set = async (key, value) => client.set(key, value);

/**
 * @param {string} key
 * @return {Promise<string>}
 */
const get = async (key) => client.get(key);

/**
 * @param {string} key
 * @param {string} value
 * @return {Promise<number>}
 */
const rpush = async (key, value) => client.sendCommand(["RPUSH", key, value]);

/**
 * @param {string} key
 * @param {*} value
 * @return {Promise<number>}
 */
const rpushStruct = async (key, value) =>
  client.sendCommand(["RPUSH", key, JSON.stringify(value)]);

/**
 * @param {string} key
 * @return {Promise<string>}
 */
const lpop = async (key) => client.sendCommand(["LPOP", key]);

module.exports = {
  setup,
  redis: client,
  get,
  set,
  rpush,
  rpushStruct,
  lpop,
};
