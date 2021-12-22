const config = {
  user: 'user',
  password: 'password',
  server: 'localhost',
  database: 'SHIPMENTS',
  port: 1433,
  dialect: 'mssql',
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
  dialectOptions: {
    instanceName: 'SQLEXPRESS',
  },
  trustServerCertificate: true,
};

module.exports = config;
