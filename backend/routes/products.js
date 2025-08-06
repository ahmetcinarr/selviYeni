const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Tüm ürünleri getir
router.get('/', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = TRUE
        `;
        const params = [];

        if (category) {
            query += ` AND p.category_id = ?`;
            params.push(category);
        }

        if (search) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await pool.execute(query, params);

        // Toplam ürün sayısını al
        let countQuery = `SELECT COUNT(*) as total FROM products p WHERE p.is_active = TRUE`;
        const countParams = [];

        if (category) {
            countQuery += ` AND p.category_id = ?`;
            countParams.push(category);
        }

        if (search) {
            countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Ürünleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Tek ürün detayı
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ? AND p.is_active = TRUE
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error('Ürün detayı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Yeni ürün ekleme (Admin)
router.post('/', authenticateToken, requireAdmin, [
    body('name').trim().isLength({ min: 2 }).withMessage('Ürün adı en az 2 karakter olmalıdır'),
    body('price').isFloat({ min: 0.01 }).withMessage('Geçerli bir fiyat giriniz'),
    body('category_id').isInt({ min: 1 }).withMessage('Geçerli bir kategori seçiniz'),
    body('shopier_url').isURL().withMessage('Geçerli bir Shopier URL\'si giriniz')
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

        const { name, description, price, image_url, category_id, shopier_url, stock_quantity } = req.body;

        const [result] = await pool.execute(`
            INSERT INTO products (name, description, price, image_url, category_id, shopier_url, stock_quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, description || null, price, image_url || null, category_id, shopier_url, stock_quantity || 0]);

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla eklendi',
            productId: result.insertId
        });

    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Ürün güncelleme (Admin)
router.put('/:id', authenticateToken, requireAdmin, [
    body('name').trim().isLength({ min: 2 }).withMessage('Ürün adı en az 2 karakter olmalıdır'),
    body('price').isFloat({ min: 0.01 }).withMessage('Geçerli bir fiyat giriniz'),
    body('category_id').isInt({ min: 1 }).withMessage('Geçerli bir kategori seçiniz')
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
        const { name, description, price, image_url, category_id, shopier_url, stock_quantity, is_active } = req.body;

        const [result] = await pool.execute(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, 
                shopier_url = ?, stock_quantity = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, description, price, image_url, category_id, shopier_url, stock_quantity, is_active, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Ürün başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Ürün silme (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Ürün başarıyla silindi'
        });

    } catch (error) {
        console.error('Ürün silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Admin için tüm ürünleri getir (pasif olanlar dahil)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [products] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);

        const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM products');
        const total = countResult[0].total;

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total
            }
        });

    } catch (error) {
        console.error('Admin ürünleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;