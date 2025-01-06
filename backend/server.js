const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS ayarları
app.use(cors({
  origin: ['https://davet-1.onrender.com', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Statik dosyalar için public klasörü
app.use(express.static(path.join(__dirname, 'public')));

// Loglama middleware'i
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
};

app.use(logRequest);

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://emremorali:Emre1157@cluster0.hwsyi.mongodb.net/myapp?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('[MongoDB] Bağlantı başarılı');
  console.log('[MongoDB] Veritabanı:', mongoose.connection.name);
})
.catch(err => {
  console.error('[MongoDB] Bağlantı hatası:', err);
  process.exit(1);
});

mongoose.connection.on('error', err => {
  console.error('[MongoDB] Bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Bağlantı kesildi');
});

// Event modeli
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  responses: [{
    employeeId: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'events'
});

const Event = mongoose.model('Event', eventSchema);

// API durum kontrolü
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'API çalışıyor',
    database: states[dbState],
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Event rotaları
app.post('/api/events', async (req, res) => {
  try {
    console.log('[Event] Yeni event oluşturuluyor:', req.body);
    const event = new Event(req.body);
    const savedEvent = await event.save();
    console.log('[Event] Başarıyla kaydedildi:', savedEvent._id);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('[Event] Kaydetme hatası:', error);
    res.status(500).json({ 
      error: 'Event kaydedilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    console.log('[Event] Tüm eventler getiriliyor');
    const events = await Event.find().sort({ createdAt: -1 });
    console.log(`[Event] ${events.length} event bulundu`);
    res.json(events);
  } catch (error) {
    console.error('[Event] Getirme hatası:', error);
    res.status(500).json({ 
      error: 'Events getirilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/events/:eventId/responses', async (req, res) => {
  try {
    console.log(`[Response] Event ${req.params.eventId} için yanıt ekleniyor:`, req.body);
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      console.log(`[Response] Event bulunamadı: ${req.params.eventId}`);
      return res.status(404).json({ 
        error: 'Event bulunamadı',
        timestamp: new Date().toISOString()
      });
    }
    event.responses.push(req.body);
    const updatedEvent = await event.save();
    console.log(`[Response] Yanıt başarıyla eklendi: ${updatedEvent._id}`);
    res.json(updatedEvent);
  } catch (error) {
    console.error('[Response] Yanıt ekleme hatası:', error);
    res.status(500).json({ 
      error: 'Yanıt kaydedilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ana sayfa için index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint bulunamadı',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[Error] ${timestamp}:`, err);
  res.status(500).json({ 
    error: 'Sunucu hatası',
    message: err.message,
    timestamp,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] http://localhost:${PORT} adresinde çalışıyor`);
  console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Server] MongoDB URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
}); 