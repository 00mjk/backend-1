import express from 'express';
import {
  getShippingInfo,
  createBoxSize,
  updateBoxSize,
  deleteBoxSize,
  createPrice,
  updatePrice,
  deletePrice,
  importCountries
} from '../controllers/calculator.js';

const router = express.Router();

router.get('/', getShippingInfo);
router.post('/boxSize', createBoxSize);
router.put('/boxSize/:id', updateBoxSize);
router.delete('/boxSize/:id', deleteBoxSize);
router.post('/price', createPrice);
router.put('/price/:id', updatePrice);
router.delete('/price/:id', deletePrice);
router.post('/countries', importCountries);

export default router;
