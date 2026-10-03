import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', dashboardController.getSummary);

export default router;
