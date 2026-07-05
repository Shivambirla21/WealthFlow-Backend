import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../common/middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', requireAuth, userController.getProfile);

export default router;
