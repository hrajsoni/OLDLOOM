import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?._id).populate({
      path: 'wishlist',
      select: 'name slug price images variants isPublished',
    });
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
    ).populate('wishlist');
    res.json({ status: 'ok', data: user?.wishlist });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');
    res.json({ status: 'ok', data: user?.wishlist });
  } catch (err) {
    next(err);
  }
}
