import express from 'express';

import { updateUserData, updatePhoto, editPassword } from '../controllers/profile.js';

const router = express.Router();

router.put('/:id', updateUserData);
router.put('/photo/:id', updatePhoto);
router.put('/editPwd/:id', editPassword);

export default router;