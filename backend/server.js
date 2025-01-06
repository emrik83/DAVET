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
  companyName: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  transportation: { type: String, required: true },
  visibleTo: [{ type: Number }],
  responses: [{
    employeeId: { type: Number, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'events'
});

const Event = mongoose.model('Event', eventSchema);

// Çalışan modeli
const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { 
  timestamps: true,
  collection: 'employees'
});

const Employee = mongoose.model('Employee', employeeSchema);

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
    
    // Frontend'den gelen veriyi doğrula
    const requiredFields = ['companyName', 'date', 'location', 'startTime', 'endTime', 'transportation', 'visibleTo'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik alanlar var',
        missingFields,
        timestamp: new Date().toISOString()
      });
    }

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

// Çalışan rotaları
app.get('/api/employees', async (req, res) => {
  try {
    console.log('[Employee] Tüm çalışanlar getiriliyor');
    const employees = await Employee.find().sort({ name: 1 });
    console.log(`[Employee] ${employees.length} çalışan bulundu`);
    res.json(employees);
  } catch (error) {
    console.error('[Employee] Getirme hatası:', error);
    res.status(500).json({ 
      error: 'Çalışanlar getirilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    console.log('[Employee] Yeni çalışan ekleniyor:', req.body);
    
    // Son ID'yi bul ve bir artır
    const lastEmployee = await Employee.findOne().sort({ id: -1 });
    const nextId = lastEmployee ? lastEmployee.id + 1 : 1;
    
    const employee = new Employee({
      ...req.body,
      id: nextId,
      active: true
    });
    
    const savedEmployee = await employee.save();
    console.log('[Employee] Başarıyla kaydedildi:', savedEmployee._id);
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('[Employee] Kaydetme hatası:', error);
    res.status(500).json({ 
      error: 'Çalışan kaydedilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    console.log(`[Employee] Çalışan güncelleniyor (ID: ${req.params.id}):`, req.body);
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({
        error: 'Çalışan bulunamadı',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('[Employee] Başarıyla güncellendi:', employee._id);
    res.json(employee);
  } catch (error) {
    console.error('[Employee] Güncelleme hatası:', error);
    res.status(500).json({ 
      error: 'Çalışan güncellenemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    console.log(`[Employee] Çalışan siliniyor (ID: ${req.params.id})`);
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { $set: { active: false } },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({
        error: 'Çalışan bulunamadı',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('[Employee] Başarıyla silindi:', employee._id);
    res.json({ message: 'Çalışan başarıyla silindi', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Employee] Silme hatası:', error);
    res.status(500).json({ 
      error: 'Çalışan silinemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Event güncelleme rotası
app.put('/api/events/:id', async (req, res) => {
  try {
    console.log(`[Event] Event güncelleniyor (ID: ${req.params.id}):`, req.body);
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({
        error: 'Event bulunamadı',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('[Event] Başarıyla güncellendi:', event._id);
    res.json(event);
  } catch (error) {
    console.error('[Event] Güncelleme hatası:', error);
    res.status(500).json({ 
      error: 'Event güncellenemedi',
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