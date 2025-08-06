const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Kullanıcının sepetini getir
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [cartItems] = await pool.execute(`
            SELECT c.*, p.name, p.description, p.price, p.image_url, p.shopier_url, p.stock_quantity
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ? AND p.is_active = TRUE
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        // Toplam fiyatı hesapla
        const totalAmount = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        res.json({
            success: true,
            cartItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            itemCount: cartItems.length
        });

    } catch (error) {
        console.error('Sepet getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sepete ürün ekle
router.post('/add', authenticateToken, [
    body('product_id').isInt({ min: 1 }).withMessage('Geçerli bir ürün ID\'si giriniz'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Miktar en az 1 olmalıdır')
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

        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.id;

        // Ürünün var olup olmadığını ve aktif olup olmadığını kontrol et
        const [products] = await pool.execute(
            'SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı veya aktif değil'
            });
        }

        // Stok kontrolü
        if (products[0].stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Yeterli stok bulunmuyor'
            });
        }

        // Sepette bu ürün var mı kontrol et
        const [existingCartItem] = await pool.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existingCartItem.length > 0) {
            // Ürün zaten sepette var, miktarını güncelle
            const newQuantity = existingCartItem[0].quantity + quantity;
            
            // Yeni miktar stoktan fazla mı kontrol et
            if (newQuantity > products[0].stock_quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Sepetteki toplam miktar stok miktarını aşamaz'
                });
            }

            await pool.execute(
                'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newQuantity, existingCartItem[0].id]
            );
        } else {
            // Yeni ürün ekle
            await pool.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );
        }

        res.json({
            success: true,
            message: 'Ürün sepete eklendi'
        });

    } catch (error) {
        console.error('Sepete ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sepetteki ürün miktarını güncelle
router.put('/update', authenticateToken, [
    body('product_id').isInt({ min: 1 }).withMessage('Geçerli bir ürün ID\'si giriniz'),
    body('quantity').isInt({ min: 1 }).withMessage('Miktar en az 1 olmalıdır')
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

        const { product_id, quantity } = req.body;
        const user_id = req.user.id;

        // Ürünün stok miktarını kontrol et
        const [products] = await pool.execute(
            'SELECT stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        if (quantity > products[0].stock_quantity) {
            return res.status(400).json({
                success: false,
                message: 'Yeterli stok bulunmuyor'
            });
        }

        const [result] = await pool.execute(
            'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
            [quantity, user_id, product_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sepette bu ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Sepet güncellendi'
        });

    } catch (error) {
        console.error('Sepet güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sepetten ürün çıkar
router.delete('/remove/:product_id', authenticateToken, async (req, res) => {
    try {
        const { product_id } = req.params;
        const user_id = req.user.id;

        const [result] = await pool.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sepette bu ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Ürün sepetten çıkarıldı'
        });

    } catch (error) {
        console.error('Sepetten çıkarma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Sepeti temizle
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        res.json({
            success: true,
            message: 'Sepet temizlendi'
        });

    } catch (error) {
        console.error('Sepet temizleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Shopier'e yönlendirme için sepet bilgilerini al
router.get('/checkout-info', authenticateToken, async (req, res) => {
    try {
        const [cartItems] = await pool.execute(`
            SELECT c.*, p.name, p.price, p.shopier_url
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ? AND p.is_active = TRUE
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Sepetiniz boş'
            });
        }

        // Her ürün için Shopier URL'lerini döndür
        const checkoutItems = cartItems.map(item => ({
            productId: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            shopierUrl: item.shopier_url,
            totalPrice: item.price * item.quantity
        }));

        const totalAmount = checkoutItems.reduce((total, item) => total + item.totalPrice, 0);

        res.json({
            success: true,
            items: checkoutItems,
            totalAmount: parseFloat(totalAmount.toFixed(2))
        });

    } catch (error) {
        console.error('Checkout bilgileri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;