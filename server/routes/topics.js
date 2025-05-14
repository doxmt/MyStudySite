const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Content = require('../models/Content'); // ✅ 파트 모델 불러오기


// ✅ GET /api/topics - 전체 주제 조회
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({});
    res.json(topics);
  } catch (err) {
    console.error('❌ 주제 조회 실패:', err);
    res.status(500).json({ error: '서버 에러' });
  }
});

// ✅ POST /api/topics - 새 주제 추가
router.post('/', async (req, res) => {
  try {
    console.log("📥 POST /api/topics 요청:", req.body);

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '주제 이름이 필요합니다.' });

    const exists = await Topic.findOne({ name });
    if (exists) return res.status(409).json({ error: '이미 존재하는 주제입니다.' });

    const topic = new Topic({ name });
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    console.error('❌ 주제 추가 실패:', err);
    res.status(500).json({ error: '서버 에러' });
  }
});

// ✅ DELETE /api/topics?name=HTML - 쿼리 방식으로 삭제
router.delete('/', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: '삭제할 주제 이름이 필요합니다.' });

  try {
    // ✅ 1. 주제 삭제
    await Topic.deleteOne({ name });

    // ✅ 2. 해당 주제에 연결된 파트도 삭제
    const result = await Content.deleteMany({ topic: name });
    console.log(`🗑 "${name}" 주제와 연결된 파트 ${result.deletedCount}개 삭제됨`);

    res.json({ message: `${name} 주제와 연결된 파트가 모두 삭제되었습니다.` });
  } catch (err) {
    console.error('❌ 주제 삭제 실패:', err);
    res.status(500).json({ error: '주제 삭제 중 오류 발생' });
  }
});

module.exports = router;
