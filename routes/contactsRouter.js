const express = require('express');

const ctrl = require('../controllers/contactsControllers.js');
const contactsRouter = express.Router();

const { shemas } = require('../models/contact.js');
const { validateBody, isValidId, authentificate } = require('../midldlewares');

contactsRouter.get('/', authentificate, ctrl.getAllContacts);

contactsRouter.get('/:id', authentificate, isValidId, ctrl.getOneContact);

contactsRouter.post(
	'/',
	authentificate,
	validateBody(shemas.createContactSchema),
	ctrl.createContact
);

contactsRouter.put(
	'/:id',
	authentificate,
	isValidId,
	validateBody(shemas.createContactSchema),
	ctrl.updateContact
);

contactsRouter.delete('/:id', authentificate, isValidId, ctrl.deleteContact);

module.exports = contactsRouter;
