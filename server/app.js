const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./services/databaseService');
const { initializeDatabase } = require('./services/databaseService');

//flutter 웹앱은 데이터를 crossorigin으로 통신하기떄문에 cors설정 추가
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
const itemsRoutes = require('./routes/itemsRoutes');
const purchseRoutes = require('./routes/purchaseRoutes');
const salesRoutes = require('./routes/salesRoutes');
//prefilight 관련
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});


app.use(express.json()); //body 파싱관련

app.use('/rankings', rankingsRoutes);
app.use('/users', usersRoutes);
app.use('/items',itemsRoutes);
app.use('/purchase',purchseRoutes);
app.use('/sales',salesRoutes);

//서버 데이터 베이스 초기화
app.get('/', async (req, res) => {
  await initializeDatabase();
  res.send("data reset");
});

module.exports = app;