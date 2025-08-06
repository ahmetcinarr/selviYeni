const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['http://localhost:3000'] // Üretim ortamında frontend domainini ekleyin
        : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pages', pageRoutes);

// Kullanıcı siparişleri endpoint'ini auth route'una ekle
const { pool } = require('./config/database');
const { authenticateToken } = require('./middleware/auth');

app.get('/api/user/orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT o.*, p.name as product_name, p.image_url
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error('Kullanıcı siparişleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Selvi GSM API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint bulunamadı'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Sunucu hatası:', error);
    res.status(500).json({
        success: false,
        message: 'Beklenmeyen bir hata oluştu'
    });
});

// Server başlatma
const startServer = async () => {
    try {
        // Veritabanı bağlantısını test et
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Veritabanı bağlantısı başarısız. Server başlatılamadı.');
            process.exit(1);
        }

        // Uploads klasörünü oluştur
        const fs = require('fs');
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Uploads klasörü oluşturuldu');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Selvi GSM Backend Server ${PORT} portunda çalışıyor`);
            console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
            console.log(`🔒 Admin Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD}`);
        });

    } catch (error) {
        console.error('❌ Server başlatma hatası:', error);
        process.exit(1);
    }
};

startServer();