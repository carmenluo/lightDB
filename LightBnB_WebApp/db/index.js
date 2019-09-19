const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightdb'
});

module.exports = {
  query: (text, params) => {
    const start = Date.now();
    //you can call the logging first and then pass into database, kinda chaining together
     pool.query(text, params).then(res => {
      const duration = Date.now() - start;
      console.log('i execute here', { text, duration, rows: res.rowCount })
    });
    return pool.query(text, params) }
}
