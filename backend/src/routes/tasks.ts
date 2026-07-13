import { Router } from 'express';
import { taskController } from '../controllers/task.controller.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, taskController.findAssigned);
router.get('/projects/:projectId/tasks', requireAuth, taskController.findByProject);
router.post('/projects/:projectId/tasks', requireAuth, taskController.create);
router.get('/:id', requireAuth, taskController.findById);
router.patch('/:id', requireAuth, taskController.update);
router.patch('/:id/status', requireAuth, taskController.updateStatus);
router.delete('/:id', requireAuth, taskController.delete);

export default router;
