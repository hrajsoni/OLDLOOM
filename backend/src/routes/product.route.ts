import { Router } from 'express';
import {
  listProducts,
  getProduct,
  getFeaturedProducts,
} from '../controllers/product.controller';

const router = Router();

router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProduct);

export default router;
