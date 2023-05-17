import express from 'express';
import {
  getMeetingsInfo,
  createMeeting,
  updateMeeting,
  deleteMeeting
} from '../controllers/meeting.js';

const router = express.Router();

router.get('/', getMeetingsInfo);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

export default router;
