export default {
  dialect: 'mssql',
  host: 'localhost',
  server: 'localhost',
  port: 1433,
  dialectOptions: {
    instanceName: 'MSSQLSERVER'
  },
  pool: {
    max: 5,
    min: 1,
    idle: 10000
  }
};
