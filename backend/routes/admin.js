const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard istatistikleri
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Toplam kullanıcı sayısı
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE');
        
        // Toplam ürün sayısı
        const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
        
        // Aktif ürün sayısı
        const [activeProductCount] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
        
        // Toplam kategori sayısı
        const [categoryCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
        
        // Toplam sipariş sayısı
        const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
        
        // Bu ayki sipariş sayısı
        const [monthlyOrderCount] = await pool.execute(`
            SELECT COUNT(*) as count FROM orders 
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);
        
        // En çok satan ürünler (son 30 gün)
        const [topProducts] = await pool.execute(`
            SELECT p.name, SUM(o.quantity) as total_sold, SUM(o.total_amount) as total_revenue
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            stats: {
                totalUsers: userCount[0].count,
                totalProducts: productCount[0].count,
                activeProducts: activeProductCount[0].count,
                totalCategories: categoryCount[0].count,
                totalOrders: orderCount[0].count,
                monthlyOrders: monthlyOrderCount[0].count,
                topProducts
            }
        });

    } catch (error) {
        console.error('Dashboard istatistikleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı listesi
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, first_name, last_name, email, is_admin, created_at
            FROM users
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await pool.execute(query, params);

        // Toplam kullanıcı sayısı
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];

        if (search) {
            countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });

    } catch (error) {
        console.error('Kullanıcı listesi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı silme
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Admin kullanıcısının kendisini silmesini engelle
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });

    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sayfa içeriklerini getir
router.get('/page-contents', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [contents] = await pool.execute('SELECT * FROM page_contents ORDER BY page_name');

        res.json({
            success: true,
            contents
        });

    } catch (error) {
        console.error('Sayfa içerikleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sayfa içeriği güncelleme
router.put('/page-contents/:pageName', authenticateToken, requireAdmin, [
    body('title').trim().isLength({ min: 1 }).withMessage('Başlık gereklidir'),
    body('content').trim().isLength({ min: 1 }).withMessage('İçerik gereklidir')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Girilen bilgilerde hata var',
                errors: errors.array()
            });
        }

        const { pageName } = req.params;
        const { title, content } = req.body;

        const [result] = await pool.execute(`
            UPDATE page_contents 
            SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE page_name = ?
        `, [title, content, pageName]);

        if (result.affectedRows === 0) {
            // Eğer sayfa içeriği yoksa oluştur
            await pool.execute(`
                INSERT INTO page_contents (page_name, title, content) 
                VALUES (?, ?, ?)
            `, [pageName, title, content]);
        }

        res.json({
            success: true,
            message: 'Sayfa içeriği başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Sayfa içeriği güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sipariş geçmişi
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, u.first_name, u.last_name, u.email, p.name as product_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND o.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await pool.execute(query, params);

        // Toplam sipariş sayısı
        let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ` AND status = ?`;
            countParams.push(status);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            }
        });

    } catch (error) {
        console.error('Sipariş geçmişi getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sipariş durumu güncelleme
router.put('/orders/:id/status', authenticateToken, requireAdmin, [
    body('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Geçerli bir durum seçiniz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Girilen bilgilerde hata var',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Sipariş durumu güncellendi'
        });

    } catch (error) {
        console.error('Sipariş durumu güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;