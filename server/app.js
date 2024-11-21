const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./services/databaseService');
const { initializeDatabase } = require('./services/databaseService');

app.use(cors({
  origin: '*', // 모든 도메인에서 접근 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // 필요한 헤더만 허용
}));
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.sendStatus(200);
});
// 라우터 등록
const rankingsRoutes = require('./routes/rankingsRoutes');
const usersRoutes = require('./routes/usersRoutes');
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/rankings', rankingsRoutes);
app.use('/users', usersRoutes);

app.get('/', async (req, res) => {
  await initializeDatabase();
  res.send("data reset");
});

module.exports = app;