import { Router } from 'express';
import { projectController } from '../controllers/project.controller.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, projectController.findAll);
router.get('/:id', requireAuth, projectController.findById);
router.post('/', requireAuth, requireRole('ADMIN', 'PROJECT_MANAGER'), projectController.create);
router.put('/:id', requireAuth, projectController.update);
router.delete('/:id', requireAuth, projectController.delete);
router.patch('/:id/status', requireAuth, projectController.updateStatus);

export default router;
