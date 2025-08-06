const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT token doğrulama middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Erişim token\'ı bulunamadı' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcının veritabanında var olup olmadığını kontrol et
        const [users] = await pool.execute(
            'SELECT id, email, is_admin FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Geçersiz token' 
            });
        }

        req.user = {
            id: decoded.userId,
            email: users[0].email,
            isAdmin: users[0].is_admin
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Geçersiz token' 
        });
    }
};

// Admin yetkisi kontrolü
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gereklidir'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};