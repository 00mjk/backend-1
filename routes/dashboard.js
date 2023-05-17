import express from 'express';
import { getDashboardInfo, getMedianAndAverage } from '../controllers/dashboard.js';

const router = express.Router();

router.get('/:id', getDashboardInfo);
router.post('/filter', getDashboardInfo);
router.post('/med', getMedianAndAverage);
// router.get('/chart/:id', getDashboardInfo);

export default router;
