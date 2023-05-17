import express from 'express';
import { 
  getPurchasesInfo, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createPurchase, 
  updatePurchase, 
  deletePurchase,
  getArrivedPurchases
} from '../controllers/purchase.js';

const router = express.Router();

router.get('/', getPurchasesInfo);

router.post('/product', createProduct);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);

router.post('/purchase', createPurchase);
router.put('/purchase/:id', updatePurchase);
router.put('/purchase_del/:id', deletePurchase);

router.post('/arrived', getArrivedPurchases);

export default router;
