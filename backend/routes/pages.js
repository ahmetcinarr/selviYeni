const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Sayfa içeriğini getir
router.get('/:pageName', async (req, res) => {
    try {
        const { pageName } = req.params;

        const [contents] = await pool.execute(
            'SELECT * FROM page_contents WHERE page_name = ?',
            [pageName]
        );

        if (contents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sayfa içeriği bulunamadı'
            });
        }

        res.json({
            success: true,
            content: contents[0]
        });

    } catch (error) {
        console.error('Sayfa içeriği getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı siparişlerini getir (Hesabım sayfası için)
router.get('/user/orders', async (req, res) => {
    try {
        // Bu endpoint'i kullanıcı girişi gerektiren bir route olarak auth.js'de tanımlayacağız
        res.json({
            success: false,
            message: 'Bu endpoint için kimlik doğrulama gereklidir'
        });

    } catch (error) {
        console.error('Kullanıcı siparişleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;