import mongoose, { Schema, Document } from 'mongoose';

// Problem completion record
export interface IProblemCompletion extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: number;
  courseId: string;
  completed: boolean;
  solution?: string;
  completedAt?: Date;
}

const ProblemCompletionSchema = new Schema<IProblemCompletion>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Number, required: true },
  courseId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  solution: { type: String },
  completedAt: { type: Date },
}, {
  timestamps: true
});

// Create a compound index for efficiently looking up user's progress
ProblemCompletionSchema.index({ userId: 1, courseId: 1, problemId: 1 }, { unique: true });

// Course progress tracking
export interface ICourseProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  totalProblems: number;
  completedProblems: number;
  lastProblemId?: number;
  overallProgress: number;
  lastUpdated: Date;
}

const CourseProgressSchema = new Schema<ICourseProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  totalProblems: { type: Number, default: 30 },
  completedProblems: { type: Number, default: 0 },
  lastProblemId: { type: Number },
  overallProgress: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Create a unique index to ensure one record per user per course
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Create models
export const ProblemCompletion = mongoose.models.ProblemCompletion || 
  mongoose.model<IProblemCompletion>('ProblemCompletion', ProblemCompletionSchema);

export const CourseProgress = mongoose.models.CourseProgress || 
  mongoose.model<ICourseProgress>('CourseProgress', CourseProgressSchema);

// Define interface for Progress
export interface IProgress extends Document {
  userId: string;
  courseId: string;
  problemCompletions: {
    [problemId: string]: {
      completedAt: Date;
      solution?: string;
    }
  };
  lastAccessedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  problemCompletions: {
    type: Map,
    of: ProblemCompletionSchema,
    default: {}
  },
  lastAccessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index for efficient lookups
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Export Progress model if it doesn't already exist
const Progress = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
