const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 라우터 불러오기
const topicRoutes = require('./routes/topics');
const contentRoutes = require('./routes/contents');

app.use(cors());
app.use(express.json());

// ✅ 라우터 연결
app.use('/api/topics', topicRoutes);
app.use('/api/contents', contentRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB 연결 성공');
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
}).catch(err => console.error('❌ MongoDB 연결 실패:', err));
