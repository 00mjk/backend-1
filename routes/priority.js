import express from 'express';
import { getArchivePriorities, getHistory } from '../controllers/priority.js';

const router = express.Router();

router.post('/archive', getArchivePriorities);
router.get('/history/:id', getHistory);
export default router;
