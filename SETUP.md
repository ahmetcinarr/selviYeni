# 🚀 Selvi GSM Kurulum Talimatları

Bu dosya, Selvi GSM e-ticaret projesini yerel ortamınızda çalıştırmak için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

Sisteminizde aşağıdaki yazılımların yüklü olması gerekmektedir:

- **Node.js** (v16.0.0 veya üzeri) - [İndir](https://nodejs.org/)
- **MySQL** (v8.0 veya üzeri) - [İndir](https://dev.mysql.com/downloads/)
- **Git** - [İndir](https://git-scm.com/)

## 🔧 Kurulum Adımları

### 1. Projeyi İndirin

```bash
# Projeyi klonlayın
git clone <repository-url>
cd selvi-gsm-ecommerce
```

### 2. Bağımlılıkları Yükleyin

```bash
# Ana dizinde tüm paketleri yükle
npm run install-all

# Veya manuel olarak:
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. MySQL Veritabanını Hazırlayın

#### MySQL'e bağlanın:
```bash
mysql -u root -p
```

#### Veritabanını oluşturun:
```sql
CREATE DATABASE selvi_gsm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Backend Yapılandırması

#### .env dosyasını oluşturun:
```bash
cd backend
cp .env.example .env
```

#### .env dosyasını düzenleyin:
```env
# Veritabanı Ayarları
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=selvi_gsm
DB_PORT=3306

# JWT Ayarları
JWT_SECRET=selvi_gsm_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# Server Ayarları
PORT=5000
NODE_ENV=development

# Admin Ayarları
ADMIN_EMAIL=admin@selvigsm.com
ADMIN_PASSWORD=admin123

# Upload Ayarları
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
```

### 5. Veritabanını Başlatın

```bash
# Backend klasöründe
cd backend
npm run db:init
```

Bu komut:
- Gerekli tabloları oluşturacak
- Admin kullanıcısını ekleyecek
- Örnek kategorileri ve ürünleri ekleyecek
- Sayfa içeriklerini oluşturacak

### 6. Uygulamayı Başlatın

#### Tüm servisleri birlikte başlatmak için:
```bash
# Ana dizinde
npm run dev
```

#### Veya ayrı ayrı başlatmak için:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## 🌐 Erişim Bilgileri

Uygulama başarıyla başlatıldıktan sonra:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 👤 Giriş Bilgileri

### Admin Hesabı
- **E-posta**: admin@selvigsm.com
- **Şifre**: admin123

### Test Kullanıcısı Oluşturma
Kayıt sayfasından yeni kullanıcı oluşturabilirsiniz: http://localhost:3000/register

## 🗄️ Veritabanı Tabloları

Kurulum sonrası aşağıdaki tablolar oluşturulacak:

- `users` - Kullanıcı bilgileri
- `categories` - Ürün kategorileri
- `products` - Ürün bilgileri
- `cart` - Sepet öğeleri
- `orders` - Sipariş geçmişi
- `page_contents` - Sayfa içerikleri (Hakkımızda, KVKK)

## 📊 Örnek Veriler

Kurulum sırasında aşağıdaki örnek veriler eklenir:

### Kategoriler:
- Telefonlar
- Aksesuarlar

### Örnek Ürünler:
- iPhone 15 Pro (45,000₺)
- Samsung Galaxy S24 (35,000₺)
- iPhone Şarj Kablosu (299₺)
- Wireless Şarj Aleti (450₺)

## 🔧 Geliştirme Komutları

```bash
# Backend geliştirme sunucusu
cd backend
npm run dev

# Frontend geliştirme sunucusu
cd frontend
npm start

# Veritabanını sıfırla ve yeniden oluştur
cd backend
npm run db:init

# Production build
cd frontend
npm run build
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar:

#### 1. MySQL Bağlantı Hatası
```
❌ MySQL bağlantı hatası: Access denied for user 'root'@'localhost'
```
**Çözüm**: .env dosyasındaki MySQL kullanıcı adı ve şifresini kontrol edin.

#### 2. Port Zaten Kullanımda
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Çözüm**: Portları değiştirin veya çalışan servisleri durdurun.

#### 3. Node Modules Hatası
```
Module not found: Can't resolve 'some-module'
```
**Çözüm**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Hatası
Frontend'den backend'e istek atarken CORS hatası alıyorsanız, backend/server.js dosyasındaki CORS ayarlarını kontrol edin.

## 📱 Mobil Test

Uygulamayı mobil cihazlarda test etmek için:

1. Bilgisayar ve mobil cihazın aynı ağda olduğundan emin olun
2. Bilgisayarınızın IP adresini bulun
3. Mobil tarayıcıda `http://[IP_ADRESI]:3000` adresine gidin

## 🚀 Production Deployment

Production ortamı için:

1. `.env` dosyasında `NODE_ENV=production` yapın
2. Güvenlik için JWT_SECRET'ı değiştirin
3. MySQL veritabanını production sunucusunda oluşturun
4. Frontend build alın: `npm run build`
5. Gerekli environment variable'ları ayarlayın

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:

1. Bu dokümandaki sorun giderme bölümünü kontrol edin
2. Console loglarını kontrol edin
3. GitHub Issues bölümünde benzer sorunları arayın

---

✅ **Kurulum tamamlandı!** Selvi GSM e-ticaret platformunu kullanmaya başlayabilirsiniz.