const express = require('express');

const ctrl = require('../controllers/authControllers.js');
const authRouter = express.Router();

const { validateBody, authentificate, upload } = require('../midldlewares');
const { schemas } = require('../models/user.js');

authRouter.post('/register', validateBody(schemas.registerSchema), ctrl.register);

authRouter.post('/login', validateBody(schemas.loginSchema), ctrl.login);

authRouter.get('/current', authentificate, ctrl.current);

authRouter.post('/logout', authentificate, ctrl.logout);

authRouter.patch('/avatar', authentificate, upload.single('avatar'), ctrl.changeAvatar);

authRouter.get('/verify/:verificationToken', ctrl.verifyEmail);

authRouter.post('/verify', validateBody(schemas.emailSchema), ctrl.resendVerifyEmail);

module.exports = authRouter;
