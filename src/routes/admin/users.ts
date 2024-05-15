import express from 'express';
import { verifyToken } from '../../middlewares/AuthJWT';
import { isAdmin, isAdminOrModerator } from '../../middlewares/Permission';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/admin/users.admin';

const router = express.Router();

router.get('/', [verifyToken, isAdminOrModerator], getUsers);
router.get('/:id', [verifyToken, isAdminOrModerator], getUsers);

router.post('/', [verifyToken, isAdmin], createUser);

router.put('/:id', [verifyToken, isAdmin], updateUser);

router.delete('/:id', [verifyToken, isAdmin], deleteUser);

export default router;
