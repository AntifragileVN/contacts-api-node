const { HttpError } = require('../helpers');

const validateBody = (schema) => {
	const func = (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false });

		if (error) {
			const { details } = error;
			const message = details.map((i) => i.message).join(',');
			next(HttpError(400, message));
		}
		next();
	};

	return func;
};

module.exports = validateBody;
