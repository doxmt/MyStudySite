const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:5500',
  'http://192.168.0.43:5500'
];



app.use(cors({
  origin: function (origin, callback) {
    console.log('🔥 요청 origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 차단됨'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/topics', require('./routes/topics'));
app.use('/api/contents', require('./routes/contents'));



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행 중: http://192.168.0.43:${PORT}`);
});
