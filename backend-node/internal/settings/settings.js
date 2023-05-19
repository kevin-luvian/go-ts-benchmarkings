const dotenv = require("dotenv");
var url = require("url");

const Server = {
  id: "server-" + (Math.random() + 1).toString(36).substring(7),
  env: "development",
  runMode: "debug",
  httpPort: 8000,
  readTimeout: 60000,
  writeTimeout: 60000,
  cors: "*",
};

const Database = {
  host: "localhost",
  user: "user",
  port: "9100",
  password: "password",
  database: "database",
  connectionLimit: 70,
};

const Redis = {
  host: "localhost",
  port: "9101",
  password: "password",
  queueName: "progress-queue",
  maxIdle: 10,
  maxActive: 10,
  idleTimeout: 5 * 60 * 1000,
  maxAge: 1 * 60 * 60 * 1000,
};

// Redis = &RedisSetting{
//   Host:        "localhost:9101",
//   Password:    "redispassword",
//   QueueName:   "progress-queue",
//   MaxIdle:     10,
//   MaxActive:   10,
//   IdleTimeout: 5 * time.Minute,
//   MaxAge:      1 * time.Hour,
// }

const init = () => {
  dotenv.config();

  const {
    ENV,
    RUN_MODE,
    DATABASE_URL,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_QUEUE_NAME,
  } = process.env;
  Server.env = useOrDefault(ENV, Server.env);
  Server.runMode = useOrDefault(RUN_MODE, Server.runMode);

  const dbConf = parseDatabaseUrl(DATABASE_URL);
  Database.host = useOrDefault(dbConf.host, Database.host);
  Database.port = useOrDefault(dbConf.port, Database.port);
  Database.user = useOrDefault(dbConf.user, Database.user);
  Database.password = useOrDefault(dbConf.password, Database.password);
  Database.database = useOrDefault(dbConf.database, Database.database);

  const redisConf = REDIS_HOST.split(":");
  Redis.host = useOrDefault(redisConf[0], Redis.host);
  Redis.port = useOrDefault(redisConf[1], Redis.port);
  Redis.queueName = useOrDefault(REDIS_QUEUE_NAME, Redis.queueName);
  Redis.password = useOrDefault(REDIS_PASSWORD, Redis.password);
};

const useOrDefault = (value, defaultValue) => {
  return value ? value : defaultValue;
};

const parseDatabaseUrl = (dbUrl) => {
  const parsedUrl = url.parse(dbUrl, false, true);
  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    user: parsedUrl.auth.split(":")[0],
    password: parsedUrl.auth.split(":")[1],
    database: parsedUrl.pathname.replace(/\//g, ""),
  };
};

module.exports = { init, Server, Database, Redis };
