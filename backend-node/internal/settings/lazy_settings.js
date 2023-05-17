const Server = {
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
  connectionLimit: 10,
};

module.exports = { Server, Database };
