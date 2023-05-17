import express from 'express';
import { getSpecBattlefield } from '../controllers/battlefield.js';

const router = express.Router();
console.log('cal asd')
router.post('/ordersperiod', getSpecBattlefield);

export default router;
