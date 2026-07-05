import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/oauth/google', authController.googleRedirect);
router.get('/oauth/google/callback', authController.googleCallback);
router.get('/oauth/facebook', authController.facebookRedirect);
router.get('/oauth/facebook/callback', authController.facebookCallback);

export default router;
