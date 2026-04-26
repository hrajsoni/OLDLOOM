import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'customer'
  | 'support_staff'
  | 'content_editor'
  | 'manager'
  | 'super_admin';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  phone?: string;
  provider?: 'credentials' | 'google';
  googleId?: string;
  refreshToken?: string;
  emailVerifyOtp?: string;
  emailVerifyOtpExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  storeCredit: number;
  wishlist: mongoose.Types.ObjectId[];
  addresses: IAddress[];
  invitedBy?: mongoose.Types.ObjectId;
  staffInviteToken?: string;
  staffInviteExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['customer', 'support_staff', 'content_editor', 'manager', 'super_admin'],
      default: 'customer',
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    avatar: String,
    phone: String,
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    googleId: String,
    refreshToken: { type: String, select: false },
    emailVerifyOtp: { type: String, select: false },
    emailVerifyOtpExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    storeCredit: { type: Number, default: 0, min: 0 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [AddressSchema],
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    staffInviteToken: { type: String, select: false },
    staffInviteExpiry: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ staffInviteToken: 1 });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
