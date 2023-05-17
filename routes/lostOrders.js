import express from 'express';
import {
  getLostOrdersInfo,
  createLostOrder,
  updateLostOrder,
  deleteLostOrder
} from '../controllers/lostOrders.js';

const router = express.Router();

router.get('/', getLostOrdersInfo);
router.post('/', createLostOrder);
router.put('/:id', updateLostOrder);
router.delete('/:id', deleteLostOrder);

export default router;
