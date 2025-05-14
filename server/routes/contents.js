const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

router.get('/:topic', async (req, res) => {
  const { topic } = req.params;
  const { part } = req.query; // ← part는 쿼리로 받음

  try {
    const query = part ? { topic, part } : { topic };
    const content = await Content.findOne(query);
    res.json(content || { content: '' });
  } catch (err) {
    res.status(500).json({ error: '내용을 불러오는 데 실패했습니다.' });
  }
});

router.post('/:topic', async (req, res) => {
  const { topic } = req.params;
  const { part, content } = req.body;

  if (!content) return res.status(400).json({ error: '내용이 없습니다.' });

  try {
    const query = part ? { topic, part } : { topic };
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
    res.status(500).json({ error: '내용을 저장하는 데 실패했습니다.' });
  }
});

module.exports = router;
