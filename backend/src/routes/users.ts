import { Router } from 'express';
import { userController } from '../controllers/user.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), userController.findAll);
router.post('/', requireAuth, requireRole('ADMIN'), userController.create);
router.patch('/:id/role', requireAuth, requireRole('ADMIN'), userController.updateRole);
router.delete('/:id', requireAuth, requireRole('ADMIN'), userController.delete);

export default router;
