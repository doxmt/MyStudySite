// models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  part: { type: String, required: true },
  content: { type: String, default: '' }, // ✅ 'body' → 'content'로 수정
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);
