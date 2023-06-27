const redis = require("../../internal/redis");
const { init, Redis } = require("../../internal/settings/settings");

const main = async () => {
  init();
  await redis.setup({
    host: Redis.host,
    port: Redis.port,
    queueName: Redis.queueName,
    password: Redis.password,
  });

  let res = await redis.set("test", "test", 100);
  // res = await redis.rpushStruct("test-p", { id: "test", ts: Date.now() });
  // res = await redis.rpush("test-p", "testf");
  console.log({ res });

  res = await redis.get("test");
  console.log({ res });
};

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
})();
