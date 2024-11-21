const express = require('express');
const app = express();
const cors = require('cors');

const { initializeDatabase } = require('./services/databaseService');

app.use(cors({
    origin : '*',
    methods : ['GET','DELETE'],
    allowedHeaders : ['Content-Type','Authorization'],
}));
// 라우터 등록
const rankingsRoutes = require('./routes/rankingsRoutes');
const usersRoutes = require('./routes/usersRoutes');

app.use('/rankings', rankingsRoutes);
app.use('/users', usersRoutes);

app.get('/', async (req, res) => {
    await initializeDatabase();
    res.send("data reset");
});

module.exports = app;
