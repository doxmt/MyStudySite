const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// ✅ 전체 최근 파트 10개 조회
router.get('/all', async (req, res) => {
  try {
    const recent = await Content.find({}).sort({ _id: -1 }).limit(10);
    res.json(recent);
  } catch (err) {
    console.error('❌ 전체 파트 조회 실패:', err);
    res.status(500).json({ error: '전체 파트를 불러오지 못했습니다.' });
  }
});

// ✅ 특정 토픽 + 파트 조회 (쿼리로 part)
router.get('/:topic', async (req, res) => {
  const { topic } = req.params;
  const { part } = req.query;

  try {
    const query = part ? { topic, part } : { topic };
    const content = await Content.findOne(query);
    
    if (!content) {
      return res.status(404).json({ message: '해당 내용이 존재하지 않습니다.' });
    }

    res.json(content);
  } catch (err) {
    console.error('❌ 특정 내용 조회 실패:', err);
    res.status(500).json({ error: '내용을 불러오는 데 실패했습니다.' });
  }
});

// ✅ 저장 또는 업데이트
router.post('/:topic', async (req, res) => {
  const { topic } = req.params;
  const { part, content } = req.body;

  if (!part || content === undefined) {
    return res.status(400).json({ error: 'part와 content가 모두 필요합니다.' });
  }
  

  try {
    const query = { topic, part };
    const existing = await Content.findOne(query);

    if (existing) {
      existing.content = content;
      await existing.save();
      res.json({ message: '내용이 업데이트되었습니다.' });
    } else {
      const newContent = new Content({ topic, part, content });
      await newContent.save();
      res.status(201).json({ message: '새로운 내용이 저장되었습니다.' });
    }
  } catch (err) {
    console.error('❌ 내용 저장 실패:', err);
    res.status(500).json({ error: '내용을 저장하는 데 실패했습니다.' });
  }
});
router.delete('/:topic', async (req, res) => {
  const { topic } = req.params;
  const { part } = req.query;

  console.log("📩 DELETE 요청 도착:", { topic, part });

  if (topic === undefined || part === undefined) {
    return res.status(400).json({ error: 'topic과 part가 모두 필요합니다.' });
  }
  

  try {
    const result = await Content.deleteOne({ topic, part });
    console.log("🗑 삭제 결과:", result);
    res.json({ message: `${topic} - ${part} 삭제 완료` });
  } catch (err) {
    console.error('❌ 삭제 실패:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});




module.exports = router;
