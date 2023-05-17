const dotenv = require("dotenv");
var url = require("url");

const Server = {
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

const init = () => {
  dotenv.config();

  const { ENV, RUN_MODE, DATABASE_URL } = process.env;
  Server.env = useOrDefault(ENV, Server.env);
  Server.runMode = useOrDefault(RUN_MODE, Server.runMode);

  const dbConf = parseDatabaseUrl(DATABASE_URL);
  Database.host = useOrDefault(dbConf.host, Database.host);
  Database.port = useOrDefault(dbConf.port, Database.port);
  Database.user = useOrDefault(dbConf.user, Database.user);
  Database.password = useOrDefault(dbConf.password, Database.password);
  Database.database = useOrDefault(dbConf.database, Database.database);
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

module.exports = { init, Server, Database };
