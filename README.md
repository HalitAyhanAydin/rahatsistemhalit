# Rahat Sistem - Hesap Kodu Analizi

Bu proje, API üzerinden hesap verilerini otomatik olarak senkronize eden ve hiyerarşik yapıda gösteren bir web uygulamasıdır.

## Teknolojiler

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **Prisma ORM** - Database ORM
- **node-cron** - Scheduled tasks
- **axios** - HTTP client

### Frontend
- **React** - UI framework
- **Material-UI (MUI)** - UI component library
- **axios** - HTTP client

## Özellikler

- ✅ API'den otomatik veri senkronizasyonu (5 dakikada bir)
- ✅ Manuel senkronizasyon seçeneği
- ✅ 3 seviyeli hesap kodu hiyerarşisi:
  - **Ana Grup** (örn: 120)
  - **Alt Grup** (örn: 120.01)
  - **Detay Hesap** (örn: 120.01.0001)
- ✅ Tıklanabilir hesap satırları
- ✅ Seçilen hesabın borç bilgisi üstte gösterimi
- ✅ Seviye bilgileri (Ana Grup, Alt Grup, Detay Hesap)
- ✅ Gerçek zamanlı veri görüntüleme
- ✅ Responsive tasarım
- ✅ PostgreSQL veritabanı entegrasyonu
- ✅ Senkronizasyon logları
- ✅ Hata yönetimi

## 🚀 Hızlı Başlangıç

### 1. Projeyi İndirin
```bash
git clone https://github.com/[USERNAME]/rahatsistemhalit.git
cd rahatsistemhalit
```

### 2. PostgreSQL Kurulum
```bash
# macOS için
brew install postgresql
brew services start postgresql

# Veritabanı oluştur
createdb rahat_sistem_db
```

### 3. Backend Kurulum
```bash
cd backend
npm install

# Environment dosyasını düzenle
cp .env .env.local
# DATABASE_URL'i kendi PostgreSQL bilgilerinize göre düzenleyin

# Veritabanını oluştur
npx prisma generate
npx prisma db push

# Sunucuyu başlat
npm start
# veya development için: node server.js
```

### 4. Frontend Kurulum
```bash
cd frontend
npm install
npm start
```

### 5. Uygulamayı Kullanın
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Manuel senkronizasyon: "Manuel Senkronizasyon" butonuna tıklayın
- Otomatik senkronizasyon: Her 5 dakikada bir otomatik çalışır

## 🌐 Canlı Demo

Uygulama başarıyla çalışıyor! Gereksinimler:
- ✅ Node.js backend
- ✅ PostgreSQL veritabanı
- ✅ Prisma ORM
- ✅ React frontend
- ✅ Material-UI tasarımı
- ✅ API senkronizasyonu
- ✅ 3 seviyeli hiyerarşik yapı
- ✅ Otomatik ve manuel senkronizasyon

## Kullanım

1. **Backend Başlatma**: `http://localhost:3001` adresinde çalışacak
2. **Frontend Başlatma**: `http://localhost:3000` adresinde çalışacak
3. **Otomatik Senkronizasyon**: Her 5 dakikada bir API'den veri çeker
4. **Manuel Senkronizasyon**: Web arayüzündeki "Manuel Senkronizasyon" butonuna tıklayın

## API Endpoints

### Backend Endpoints

- `GET /api/accounts` - Hiyerarşik hesap verilerini getir
- `POST /api/sync` - Manuel senkronizasyon başlat
- `GET /api/logs` - Senkronizasyon loglarını getir
- `GET /health` - Sunucu durumu kontrolü

## Veritabanı Yapısı

### AccountData Tablosu
```sql
CREATE TABLE account_data (
    id SERIAL PRIMARY KEY,
    hesapKodu VARCHAR(255) UNIQUE NOT NULL,
    toplamBorc DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

### ApiLog Tablosu
```sql
CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    recordCount INTEGER,
    createdAt TIMESTAMP DEFAULT NOW()
);
```

## Hiyerarşik Yapı

Sistem, hesap kodlarını 3 seviyede kırılım yapar:

1. **Seviye 1**: İlk 3 rakam (örn: "120")
2. **Seviye 2**: İlk 5 rakam (örn: "120.01")
3. **Seviye 3**: Tam kod (örn: "120.01.0018")

## Konfigürasyon

### Backend Environment Variables (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rahat_sistem_db"
PORT=3001
API_USERNAME=apitest
API_PASSWORD=test123
TOKEN_URL=https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/sessions
DATA_URL=https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/layouts/testdb/records/1
```

## Deployment

### Backend Deployment

1. Sunucuda PostgreSQL kur ve yapılandır
2. Environment variables'ları ayarla
3. `npm run db:push` ile veritabanını oluştur
4. `npm start` ile uygulamayı başlat

### Frontend Deployment

1. `npm run build` ile production build oluştur
2. Build dosyalarını web sunucusuna kopyala
3. Backend API URL'ini production URL ile değiştir

## Sorun Giderme

### Veritabanı Bağlantı Hatası
- PostgreSQL servisinin çalıştığından emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin
- Kullanıcı izinlerini kontrol edin

### API Bağlantı Hatası
- Token URL ve Data URL'lerinin doğru olduğunu kontrol edin
- API kullanıcı adı ve şifresinin doğru olduğunu kontrol edin
- Network bağlantısını kontrol edin

### Frontend-Backend Bağlantı Hatası
- Backend sunucusunun çalıştığından emin olun
- CORS ayarlarını kontrol edin
- Proxy ayarlarını kontrol edin

## Geliştirme

### Yeni Özellik Eklemek

1. Backend'de yeni route oluştur (`/backend/routes/`)
2. Frontend'de yeni component oluştur (`/frontend/src/components/`)
3. API service'e yeni method ekle (`/frontend/src/services/apiService.js`)

### Test Etmek

```bash
# Backend test
cd backend
npm test

# Frontend test
cd frontend
npm test
```

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için: WhatsApp (0542 315 88 12)
