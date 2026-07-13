import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/task/:taskId', requireAuth, commentController.findByTask);
router.post('/task/:taskId', requireAuth, commentController.create);

export default router;
