import express from 'express';
// import auth from '../middleware/auth.js';
import { getNewClientsStat, getSelectedNewClientsStat } from '../controllers/statistic.js';

const router = express.Router();

// router.get('/', getAllStatisticsInfo);
// router.get('/stat/:id', getManagerStatistic);
router.get('/new_clients', getNewClientsStat);
router.post('/selected_clients', getSelectedNewClientsStat);

export default router;
