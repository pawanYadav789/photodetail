require('dotenv').config();
const sql = require('mssql'); 

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true for Azure or remote servers
    trustServerCertificate: true, 
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => {
    console.log(' Connected to SQL Server:', process.env.DB_SERVER);
  })
  .catch(err => {
    console.error(' SQL Connection Failed:', err.message);
  });

module.exports = {
  sql,
  pool,
  poolConnect,
};
