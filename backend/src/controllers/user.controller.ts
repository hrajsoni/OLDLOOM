import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

// ── Wishlist ─────────────────────────────────────────────────────────────────

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?._id).populate('wishlist');
    if (!user) throw new AppError('User not found', 404);
    res.json({ status: 'ok', data: user.wishlist });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );
    res.json({ status: 'ok', message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user?._id, { $pull: { wishlist: productId } });
    res.json({ status: 'ok', message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
}

// ── Addresses ────────────────────────────────────────────────────────────────

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
    const address = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    if (address.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({ status: 'ok', data: user.addresses[user.addresses.length - 1] });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    const addr = user.addresses.id(id);
    if (!addr) throw new AppError('Address not found', 404);

    if (updates.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(addr, updates);
    await user.save();

    res.json({ status: 'ok', data: addr });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(req.user?._id, { $pull: { addresses: { _id: id } } });
    res.json({ status: 'ok', message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
}
