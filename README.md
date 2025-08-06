# 📱 Selvi GSM - E-ticaret Web Sitesi

Modern ve kullanıcı dostu Türkçe GSM e-ticaret platformu. React, Node.js ve MySQL teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 📱 Kullanıcı Özellikleri
- **Modern Arayüz**: Responsive ve kullanıcı dostu tasarım
- **Üye Sistemi**: Kayıt ol, giriş yap, profil yönetimi
- **Ürün Katalogu**: Telefonlar ve aksesuarlar için ayrı kategoriler
- **Sepet Sistemi**: Ürün ekleme, çıkarma, miktar güncelleme
- **Shopier Entegrasyonu**: Güvenli ödeme için Shopier'e yönlendirme
- **Sipariş Takibi**: Kullanıcılar geçmiş siparişlerini görüntüleyebilir

### 🛠️ Admin Özellikleri
- **Dashboard**: İstatistikler ve genel bakış
- **Ürün Yönetimi**: Ürün ekleme, düzenleme, silme
- **Kategori Yönetimi**: Kategori oluşturma ve düzenleme
- **Kullanıcı Yönetimi**: Kullanıcıları görüntüleme ve yönetme
- **İçerik Yönetimi**: Hakkımızda ve KVKK sayfalarını düzenleme
- **Sipariş Yönetimi**: Siparişleri görüntüleme ve durum güncelleme

## 🏗️ Teknoloji Stack

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - İlişkisel veritabanı
- **JWT** - Kimlik doğrulama
- **bcryptjs** - Şifre hashleme
- **multer** - Dosya yükleme

### Frontend
- **React** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - İkon kütüphanesi

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- MySQL (v8.0 veya üzeri)
- npm veya yarn

## 🚀 Kurulum

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd selvi-gsm-ecommerce
```

### 2. Bağımlılıkları yükleyin
```bash
# Tüm paketleri yükle (root, backend, frontend)
npm run install-all
```

### 3. Veritabanı kurulumu
```bash
# MySQL'de selvi_gsm veritabanını oluşturun
# Backend klasöründe .env dosyasını düzenleyin
cd backend
cp .env.example .env
# .env dosyasındaki veritabanı bilgilerini güncelleyin
```

### 4. Veritabanını başlatın
```bash
cd backend
npm run db:init
```

### 5. Uygulamayı başlatın
```bash
# Ana dizinde (hem backend hem frontend'i başlatır)
npm run dev
```

## 🔧 Yapılandırma

### Backend (.env)
```env
# Veritabanı
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=selvi_gsm
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@selvigsm.com
ADMIN_PASSWORD=admin123
```

### Frontend
Frontend otomatik olarak `http://localhost:3000` adresinde çalışacaktır.
Backend API `http://localhost:5000/api` adresinde erişilebilir.

## 📚 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Kullanıcı profili

### Ürünler
- `GET /api/products` - Tüm ürünler
- `GET /api/products/:id` - Tek ürün detayı
- `POST /api/products` - Yeni ürün (Admin)
- `PUT /api/products/:id` - Ürün güncelle (Admin)
- `DELETE /api/products/:id` - Ürün sil (Admin)

### Sepet
- `GET /api/cart` - Kullanıcı sepeti
- `POST /api/cart/add` - Sepete ürün ekle
- `PUT /api/cart/update` - Sepet güncelle
- `DELETE /api/cart/remove/:id` - Sepetten ürün çıkar

### Admin
- `GET /api/admin/dashboard` - Dashboard istatistikleri
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/orders` - Sipariş listesi

## 🎨 Tasarım

- **Renk Paleti**: Modern gradyan renkler (#667eea, #764ba2)
- **Tipografi**: Segoe UI font ailesi
- **Responsive**: Mobil-first yaklaşım
- **Animasyonlar**: Smooth CSS transitions
- **Icons**: Feather Icons (React Icons)

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Input validation
- SQL injection koruması
- CORS yapılandırması
- Helmet.js güvenlik middleware'i

## 🚀 Deployment

### Backend Deployment
1. Çevresel değişkenleri üretim için ayarlayın
2. Veritabanını üretim sunucusunda oluşturun
3. `npm run build` ile production build alın

### Frontend Deployment
1. `npm run build` ile production build alın
2. `build` klasörünü static hosting servisine yükleyin

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **E-posta**: info@selvigsm.com
- **Website**: [selvigsm.com](https://selvigsm.com)

## 🎯 Roadmap

- [ ] Gelişmiş ürün filtreleme
- [ ] Wishlist özelliği
- [ ] Canlı chat desteği
- [ ] Push notifications
- [ ] PWA desteği
- [ ] Multi-language support

---

**Selvi GSM** ile güvenli ve modern e-ticaret deneyimi! 🛍️✨
