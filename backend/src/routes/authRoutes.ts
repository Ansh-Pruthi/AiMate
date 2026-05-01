import { Router } from "express";
import * as authController from '../controllers/authController'
import { validateRegister, validateLogin } from "../validators/authValidators";

const router = Router()

router.post('/register', validateRegister, authController.register)
router.post('/login', validateLogin, authController.login)
router.post('/refresh', authController.refreshToken)

// Protected routes
router.post('/logout', authController.logout)

export default router