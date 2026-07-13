import { Router } from 'express';
import { memberController } from '../controllers/member.controller.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/project/:projectId', requireAuth, memberController.findByProject);
router.post('/project/:projectId', requireAuth, memberController.add);
router.delete('/project/:projectId/:userId', requireAuth, memberController.remove);

export default router;
