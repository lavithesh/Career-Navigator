import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  problemId: number;
  courseId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  hints: string[];
  solution?: string;
  tags: string[];
}

const ProblemSchema = new Schema<IProblem>({
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

// Create compound index for efficient lookups
ProblemSchema.index({ courseId: 1, problemId: 1 }, { unique: true });

// Use 'problems' (lowercase) as the collection name explicitly
const Problem = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema, 'problems');

export default Problem;
