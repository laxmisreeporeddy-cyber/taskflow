const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  desc:     { type: String, default: '' },
  priority: { type: String, enum: ['high','medium','low'], default: 'medium' },
  status:   { type: String, enum: ['todo','in-progress','done'], default: 'todo' },
  due:      { type: String, default: '' },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);