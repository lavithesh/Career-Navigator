const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Problem schema
const ProblemSchema = new Schema({
  problemId: { type: Number, required: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  description: { type: String, required: true },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String }
  }],
  constraints: [{ type: String }],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  hints: [{ type: String }],
  solution: { type: String },
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Create compound index
ProblemSchema.index({ courseId: 1, problemId: 1 }, { unique: true });

// Export the model
const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
module.exports = Problem; 