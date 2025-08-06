const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', [
    body('firstName').trim().isLength({ min: 2 }).withMessage('Ad en az 2 karakter olmalıdır'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Soyad en az 2 karakter olmalıdır'),
    body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
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

        const { firstName, lastName, email, password } = req.body;

        // E-posta kontrolü
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 12);

        // Kullanıcıyı kaydet
        const [result] = await pool.execute(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        // JWT token oluştur
        const token = jwt.sign(
            { userId: result.insertId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla kaydedildi',
            token,
            user: {
                id: result.insertId,
                firstName,
                lastName,
                email,
                isAdmin: false
            }
        });

    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı girişi
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir')
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

        const { email, password } = req.body;

        // Kullanıcıyı bul
        const [users] = await pool.execute(
            'SELECT id, first_name, last_name, email, password, is_admin FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
            });
        }

        const user = users[0];

        // Şifreyi kontrol et
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
            });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                isAdmin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kullanıcı profili
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, first_name, last_name, email, is_admin, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                isAdmin: user.is_admin,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Profil getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router;