import { UserRole } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

export {};
