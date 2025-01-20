import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const User = mongoose.model<IUser>('User', userSchema);