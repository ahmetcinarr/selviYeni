const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Tüm kategorileri getir
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
        );

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Kategorileri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kategoriye göre ürün sayısını getir
router.get('/with-counts', async (req, res) => {
    try {
        const [categories] = await pool.execute(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
            WHERE c.is_active = TRUE
            GROUP BY c.id
            ORDER BY c.name ASC
        `);

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Kategori sayılarını getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Tek kategori detayı
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            category: categories[0]
        });

    } catch (error) {
        console.error('Kategori detayı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Yeni kategori ekleme (Admin)
router.post('/', authenticateToken, requireAdmin, [
    body('name').trim().isLength({ min: 2 }).withMessage('Kategori adı en az 2 karakter olmalıdır')
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

        const { name, description } = req.body;

        // Aynı isimde kategori var mı kontrol et
        const [existingCategories] = await pool.execute(
            'SELECT id FROM categories WHERE name = ?',
            [name]
        );

        if (existingCategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir kategori zaten mevcut'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Kategori başarıyla eklendi',
            categoryId: result.insertId
        });

    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kategori güncelleme (Admin)
router.put('/:id', authenticateToken, requireAdmin, [
    body('name').trim().isLength({ min: 2 }).withMessage('Kategori adı en az 2 karakter olmalıdır')
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
        const { name, description, is_active } = req.body;

        // Aynı isimde başka kategori var mı kontrol et (kendi hariç)
        const [existingCategories] = await pool.execute(
            'SELECT id FROM categories WHERE name = ? AND id != ?',
            [name, id]
        );

        if (existingCategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir kategori zaten mevcut'
            });
        }

        const [result] = await pool.execute(
            'UPDATE categories SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Kategori başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kategori silme (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Bu kategoriye ait ürün var mı kontrol et
        const [products] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );

        if (products[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu kategoriye ait ürünler bulunduğu için kategori silinemez'
            });
        }

        const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Kategori başarıyla silindi'
        });

    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Admin için tüm kategorileri getir (pasif olanlar dahil)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [categories] = await pool.execute(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Admin kategorileri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;