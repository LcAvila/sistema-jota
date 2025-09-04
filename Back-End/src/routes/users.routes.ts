import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

import { authenticateJWT } from '../middlewares/auth-bypass.middleware';
import { authorizeRole } from '../middlewares/auth-bypass.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', usersController.getAllUsersController);
router.get('/:id', usersController.getUserByIdController);
router.post('/', authorizeRole('admin'), usersController.createUserController);
router.put('/:id', authorizeRole('admin'), usersController.updateUserController);
router.delete('/:id', authorizeRole('admin'), usersController.deleteUserController);

export default router;
