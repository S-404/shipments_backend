const config = {
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  server: process.env.DB_SERVER_NAME,
  database: process.env.DB_DATABASE_NAME,
  port: process.env.DB_PORT,
  dialect: process.env.DB_SERVER_DIALECT,
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
  dialectOptions: {
    instanceName: process.env.DB_SERVER_INSTANCE_NAME,
  },
  trustServerCertificate: true,
};

module.exports = config;
