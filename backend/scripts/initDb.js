const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Veritabanı bağlantısı (veritabanı olmadan)
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const initDatabase = async () => {
    try {
        console.log('🔄 Veritabanı başlatılıyor...');

        // Veritabanını oluştur
        await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Veritabanı oluşturuldu');

        // Veritabanını seç
        await connection.promise().execute(`USE ${process.env.DB_NAME}`);

        // Kullanıcılar tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users tablosu oluşturuldu');

        // Kategoriler tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories tablosu oluşturuldu');

        // Ürünler tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_url VARCHAR(500),
                category_id INT,
                shopier_url VARCHAR(500),
                stock_quantity INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Products tablosu oluşturuldu');

        // Sepet tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_product (user_id, product_id)
            )
        `);
        console.log('✅ Cart tablosu oluşturuldu');

        // Sipariş geçmişi tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                shopier_url VARCHAR(500),
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Orders tablosu oluşturuldu');

        // Sayfa içerikleri tablosu
        await connection.promise().execute(`
            CREATE TABLE IF NOT EXISTS page_contents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page_name VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(200),
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Page Contents tablosu oluşturuldu');

        // Admin kullanıcısı oluştur
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await connection.promise().execute(`
            INSERT IGNORE INTO users (first_name, last_name, email, password, is_admin)
            VALUES ('Admin', 'User', ?, ?, TRUE)
        `, [process.env.ADMIN_EMAIL, hashedPassword]);
        console.log('✅ Admin kullanıcısı oluşturuldu');

        // Varsayılan kategoriler
        await connection.promise().execute(`
            INSERT IGNORE INTO categories (id, name, description) VALUES
            (1, 'Telefonlar', 'Akıllı telefonlar ve cep telefonları'),
            (2, 'Aksesuarlar', 'Telefon aksesuarları ve yedek parçalar')
        `);
        console.log('✅ Varsayılan kategoriler eklendi');

        // Örnek ürünler
        await connection.promise().execute(`
            INSERT IGNORE INTO products (name, description, price, image_url, category_id, shopier_url, stock_quantity) VALUES
            ('iPhone 15 Pro', 'Apple iPhone 15 Pro 128GB - Titanium Blue', 45000.00, 'https://via.placeholder.com/300x300?text=iPhone+15+Pro', 1, 'https://shopier.com/selvigsm/iphone-15-pro', 10),
            ('Samsung Galaxy S24', 'Samsung Galaxy S24 256GB - Phantom Black', 35000.00, 'https://via.placeholder.com/300x300?text=Galaxy+S24', 1, 'https://shopier.com/selvigsm/galaxy-s24', 15),
            ('iPhone Şarj Kablosu', 'Orijinal Apple Lightning Kablosu', 299.00, 'https://via.placeholder.com/300x300?text=Lightning+Kablo', 2, 'https://shopier.com/selvigsm/lightning-cable', 50),
            ('Wireless Şarj Aleti', 'Kablosuz Şarj Pad 15W', 450.00, 'https://via.placeholder.com/300x300?text=Wireless+Charger', 2, 'https://shopier.com/selvigsm/wireless-charger', 25)
        `);
        console.log('✅ Örnek ürünler eklendi');

        // Sayfa içerikleri
        await connection.promise().execute(`
            INSERT IGNORE INTO page_contents (page_name, title, content) VALUES
            ('about', 'Hakkımızda', 'Selvi GSM olarak 2020 yılından beri müşterilerimize en kaliteli GSM ürünlerini sunmaktayız. Güvenilir hizmet anlayışımız ve uygun fiyat politikamızla sektörde öncü konumdayız.'),
            ('kvkk', 'KVKK - Kişisel Verileri Koruma Kanunu', 'Bu metin KVKK kapsamında kişisel verilerinizin nasıl işlendiği hakkında bilgilendirme metnidir. Detaylı bilgi için lütfen bizimle iletişime geçin.')
        `);
        console.log('✅ Sayfa içerikleri eklendi');

        console.log('🎉 Veritabanı başarıyla başlatıldı!');
        
    } catch (error) {
        console.error('❌ Veritabanı başlatma hatası:', error);
    } finally {
        connection.end();
    }
};

// Script çalıştırma
initDatabase();