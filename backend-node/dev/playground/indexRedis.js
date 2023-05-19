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

  let res;
  // res = await redis.rpushStruct("test-p", { id: "test", ts: Date.now() });
  res = await redis.rpush("test-p", "testf");
  console.log({ res });

  // res = await redis.lpop("test-p");
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
