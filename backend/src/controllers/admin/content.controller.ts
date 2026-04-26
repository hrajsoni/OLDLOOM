import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { SiteContent } from '../../models/SiteContent';

export const getContent = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      content = await SiteContent.create({});
    }
    res.json({ status: 'ok', data: content });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch content' });
  }
};

export const updateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const content = await SiteContent.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true }
    );
    res.json({ status: 'ok', data: content });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to update content' });
  }
};
