const express = require('express');

const ctrl = require('../controllers/authControllers.js');
const authRouter = express.Router();

const { validateBody, authentificate } = require('../midldlewares');
const { schemas } = require('../models/user.js');

authRouter.post('/register', validateBody(schemas.registerSchema), ctrl.register);

authRouter.post('/login', validateBody(schemas.loginSchema), ctrl.login);

authRouter.get('/current', authentificate, ctrl.current);

authRouter.post('/logout', authentificate, ctrl.logout);

module.exports = authRouter;
