const mysql = require('mysql2');
require('dotenv').config();

// Veritabanı bağlantısı için connection pool oluştur
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Promise tabanlı pool
const promisePool = pool.promise();

// Veritabanı bağlantısını test et
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ MySQL veritabanına başarıyla bağlanıldı');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL bağlantı hatası:', error.message);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};