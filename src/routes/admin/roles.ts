import express from 'express';
import { verifyToken } from '../../middlewares/AuthJWT';
import { isAdmin } from '../../middlewares/Permission';
import { getRoles } from '../../controllers/admin/roles.admin';

const router = express.Router();

router.get('/', [verifyToken, isAdmin], getRoles);

export default router;
