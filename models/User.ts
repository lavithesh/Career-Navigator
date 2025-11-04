import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  bio?: string;
  emailVerified?: Date;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  bio: { type: String },
  emailVerified: { type: Date },
  password: { type: String }, // Added for credential authentication
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Session Schema
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  expires: Date;
  sessionToken: string;
  accessToken: string;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  expires: { type: Date, required: true },
  sessionToken: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true }
}, {
  timestamps: true
});

// Create models based on whether mongoose models already exist to prevent overwrite errors
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema); 