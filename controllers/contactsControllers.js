const { Contact } = require('../models/contact.js');

const { HttpError } = require('../helpers');

const ctrlWrapper = require('../helpers/ctrlWrapper.js');
// const contactsServices = require('../services/contactsServices.js');

const getAllContacts = async (req, res) => {
	const result = await Contact.find();
	res.json(result);
};

const getOneContact = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findById(id);

	if (!result) {
		throw HttpError(404, 'Not found');
	}

	res.json(result);
};

const deleteContact = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndDelete(id);

	if (!result) {
		throw HttpError(404, 'Not found');
	}

	res.json({
		message: 'Delete success',
	});
};

const createContact = async (req, res) => {
	const result = await Contact.create(req.body);
	res.status(201).json(result);
};

const updateContact = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, 'Not found');
	}
	res.json(result);
};

module.exports = {
	getAllContacts: ctrlWrapper(getAllContacts),
	getOneContact: ctrlWrapper(getOneContact),
	createContact: ctrlWrapper(createContact),
	updateContact: ctrlWrapper(updateContact),
	deleteContact: ctrlWrapper(deleteContact),
};
