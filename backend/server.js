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
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://emremorali:Emre1157@cluster0.hwsyi.mongodb.net/myapp?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
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
    timestamp: new Date().toISOString()
  });
});

// Event rotaları
app.post('/api/events', async (req, res) => {
  try {
    console.log('Gelen event verisi:', req.body);
    const event = new Event(req.body);
    const savedEvent = await event.save();
    console.log('Kaydedilen event:', savedEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Event kaydetme hatası:', error);
    res.status(500).json({ 
      error: 'Event kaydedilemedi',
      details: error.message 
    });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    console.log('Bulunan event sayısı:', events.length);
    res.json(events);
  } catch (error) {
    console.error('Event getirme hatası:', error);
    res.status(500).json({ error: 'Events getirilemedi' });
  }
});

app.post('/api/events/:eventId/responses', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event bulunamadı' });
    }
    event.responses.push(req.body);
    const updatedEvent = await event.save();
    console.log('Yanıt eklendi:', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Yanıt kaydetme hatası:', error);
    res.status(500).json({ error: 'Yanıt kaydedilemedi' });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({ 
    error: 'Sunucu hatası',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MongoDB URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
}); 