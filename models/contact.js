const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

const contactSchema = new Schema(
	{
		name: {
			type: String,
			require: true,
		},
		email: {
			type: String,
			require: true,
		},
		phone: {
			type: String,
			require: true,
			match: /^\(\d{3}\) \d{3}-\d{4}$/,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			require: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

contactSchema.post('save', handleMongooseError);

const createContactSchema = Joi.object().keys({
	name: Joi.string().required(),
	email: Joi.string().required(),
	phone: Joi.string().required(),
});

const shemas = {
	createContactSchema,
};

const Contact = model('contact', contactSchema);

module.exports = {
	Contact,
	shemas,
};
