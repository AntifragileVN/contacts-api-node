const express = require('express');

const { isValidId } = require('../midldlewares');
const ctrl = require('../controllers/contactsControllers.js');
const contactsRouter = express.Router();

const { shemas } = require('../models/contact.js');
const { validateBody } = require('../midldlewares');

contactsRouter.get('/', ctrl.getAllContacts);

contactsRouter.get('/:id', isValidId, ctrl.getOneContact);

contactsRouter.post('/', validateBody(shemas.createContactSchema), ctrl.createContact);

contactsRouter.put(
	'/:id',
	isValidId,
	validateBody(shemas.createContactSchema),
	ctrl.updateContact
);

contactsRouter.delete('/:id', isValidId, ctrl.deleteContact);

module.exports = contactsRouter;
