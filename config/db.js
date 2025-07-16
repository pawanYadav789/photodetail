const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'LAPTOP-7CSE8CSJ', // ✅ your local server name
  database: 'StudentAppDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => {
    console.log('✅ MSSQL Connected Successfully to StudentAppDB');
  })
  .catch(err => {
    console.error('❌ DB Connection Failed:', err.message);
  });

module.exports = {
  sql,
  pool,
  poolConnect,
};
