import express from 'express';
import { verifyToken } from '../middlewares/AuthJWT';
import {
  login,
  logout,
  register,
  requestResetPassword,
  resetPassword,
} from '../controllers/authorization';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', verifyToken, logout);

router.post('/requestResetPassword', requestResetPassword);
router.post('/resetPassword', resetPassword);

export default router;
