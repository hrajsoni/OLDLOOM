import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const addressSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  isDefault: z.boolean().optional(),
});

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?._id).select('addresses');
    res.json({ status: 'ok', data: user?.addresses || [] });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = addressSchema.parse(req.body);
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    if (validated.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(validated as any);
    await user.save();

    res.status(201).json({ status: 'ok', data: user.addresses });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = addressSchema.partial().parse(req.body);
    
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    const addr = user.addresses.id(id);
    if (!addr) throw new AppError('Address not found', 404);

    if (validated.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(addr, validated);
    await user.save();

    res.json({ status: 'ok', data: user.addresses });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $pull: { addresses: { _id: id } } },
      { new: true }
    );
    res.json({ status: 'ok', data: user?.addresses });
  } catch (err) {
    next(err);
  }
}
