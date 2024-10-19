// routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { Request as JwtRequest } from 'express-jwt';
import { register, login, changePassword } from '../auth';
import authenticateToken from '../middlewares/authMiddleware'; // Ensure this import is present
import { validateRequest } from '../validation/validation';
import Joi from 'joi';
import { changePasswordSchema, loginSchema, registerSchema } from '../validation/schemas';
import checkScope from '../middlewares/scopeMiddleware'; // Ensure this import is present

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "pass123"
 *               role:
 *                 type: string
 *                 example: "viewer"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

router.post('/register', 
  authenticateToken,
  checkScope('ADMIN'), // Ensure the user has admin scope
  validateRequest(registerSchema),
  async (req: JwtRequest, res: Response) => {
    try {
      const { username, password, role } = req.body;
      const result = await register(username, password, role);
      res.json(result);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "pass123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 */
router.post('/login', 
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const result = await login(username, password);
      res.json(result);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change the user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "pass123"
 *               newPassword:
 *                 type: string
 *                 example: "newPass123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', 
  authenticateToken,
  validateRequest(changePasswordSchema),
  async (req: JwtRequest, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) {
        res.status(401).send('Unauthorized');
        return;
      }
      const result = await changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }
);

export default router;
