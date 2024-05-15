import express from 'express';
import auth from './authorization';
import roles from './admin/roles';
import users from './admin/users';

const router = express.Router();

router.get('/', (req, res) => res.sendStatus(200));

router.use('/auth', auth);

router.use('/admin/roles', roles);
router.use('/admin/users', users);

export default router;
