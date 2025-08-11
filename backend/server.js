const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const apiService = require('./services/apiService');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/accounts'));

// API data sync - her 5 dakikada bir çalışır
cron.schedule('*/5 * * * *', async () => {
  console.log('Starting API data sync...');
  try {
    await apiService.syncApiData();
    console.log('API data sync completed successfully');
  } catch (error) {
    console.error('API data sync failed:', error);
  }
});

// Manuel sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const result = await apiService.syncApiData();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Manual sync failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API sync scheduled to run every 5 minutes`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
