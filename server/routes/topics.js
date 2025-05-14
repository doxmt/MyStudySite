const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');

// ✅ GET /api/topics - 전체 주제 조회
router.get('/', async (req, res) => {
  const topics = await Topic.find({});
  res.json(topics);
});

// ✅ POST /api/topics - 새 주제 추가
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '주제 이름이 필요합니다.' });

  const exists = await Topic.findOne({ name });
  if (exists) return res.status(409).json({ error: '이미 존재하는 주제입니다.' });

  const topic = new Topic({ name });
  await topic.save();
  res.status(201).json(topic);
});

// ✅ DELETE /api/topics?name=HTML - 쿼리 방식으로 삭제
router.delete('/', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: '삭제할 주제 이름이 필요합니다.' });

  await Topic.deleteOne({ name });
  res.json({ message: `${name} 주제가 삭제되었습니다.` });
});

module.exports = router;
