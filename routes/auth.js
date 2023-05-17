import express from 'express';

import { login, forgotPassword, resetPassword } from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

export default router;