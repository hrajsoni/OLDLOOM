import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const SiteContent = mongoose.model('SiteContent');
    const content = await SiteContent.findOne().lean();
    res.json({ status: 'ok', data: content });
  } catch (err) {
    next(err);
  }
});

export default router;
