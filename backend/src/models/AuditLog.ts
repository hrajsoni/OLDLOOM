import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from './User';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  userEmail: string;
  role: UserRole;
  action: string;
  target: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    targetId: String,
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, required: true },
    userAgent: String,
  },
  { timestamps: true }
);

AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
