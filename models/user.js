const Joi = require('joi');
const { Schema, model } = require('mongoose');
const { handleMongooseError } = require('../helpers');

const subscriptionTypes = ['starter', 'pro', 'business'];

const userSchema = new Schema({
	password: {
		type: String,
		required: [true, 'Set password for user'],
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
	},
	subscription: {
		type: String,
		enum: subscriptionTypes,
		default: 'starter',
	},
	token: {
		type: String,
		default: '',
	},
	avatarURL: {
		type: String,
		required: true,
	},
	verify: {
		type: Boolean,
		default: false,
	},
	verificationToken: {
		type: String,
		required: [true, 'Verify token is required'],
	},
});

userSchema.post('save', handleMongooseError);

const registerSchema = Joi.object().keys({
	password: Joi.string().required(),
	email: Joi.string().required(),
	subscription: Joi.string().valid(...subscriptionTypes),
});

const loginSchema = Joi.object().keys({
	password: Joi.string().required(),
	email: Joi.string().required(),
});

const emailSchema = Joi.object().keys({
	email: Joi.string().required(),
});

const schemas = {
	registerSchema,
	loginSchema,
	emailSchema,
};

const User = model('user', userSchema);

module.exports = {
	User,
	schemas,
};
