const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');

const fs = require('fs/promises');
const path = require('path');

const { User } = require('../models/user.js');
const { ctrlWrapper, HttpError, sendEmail } = require('../helpers');

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email already in use');
	}

	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const avatarURL = gravatar.url(email);
	const verificationToken = nanoid();

	const newUser = await User.create({
		...req.body,
		password: hashedPassword,
		avatarURL,
		verificationToken,
	});

	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click veryfi email</a>`,
	};

	sendEmail(verifyEmail);

	res.status(201).json({
		email: newUser.email,
		subscription: newUser.subscription,
	});
};

const verifyEmail = async (req, res) => {
	const { verificationToken } = req.params;
	console.log(verificationToken);
	const user = await User.findOne({ verificationToken });

	if (!user) {
		throw HttpError(401, 'Email not found');
	}

	await User.findOneAndUpdate(user._id, { verificationToken: null, verify: true });

	res.json({
		message: 'Verification successful',
	});
};

const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email not found');
	}

	if (user.verify) {
		throw HttpError(401, 'Email already verifyed');
	}

	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click veryfi email</a>`,
	};

	sendEmail(verifyEmail);

	res.json({
		message: 'Verify email send successful',
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password invalid');
	}

	if (!user.verify) {
		throw HttpError(401, 'User not verified');
	}

	const passwordCompare = await bcrypt.compare(password, user.password);
	if (!passwordCompare) {
		throw HttpError(401, 'Email or password invalid');
	}

	const payload = {
		id: user._id,
	};

	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
	await User.findByIdAndUpdate(user._id, { token });

	res.json({
		token,
	});
};

const current = async (req, res) => {
	const { email, subscription } = req.user;
	res.json({
		email,
		subscription,
	});
};

const logout = async (req, res) => {
	const { _id } = req.user;
	await User.findByIdAndUpdate(_id, { token: '' });
	res.json({
		message: 'Logout success',
	});
};

const changeAvatar = async (req, res) => {
	const { _id } = req.user;
	const { originalname, path: tempPath } = req.file;
	Jimp.read(tempPath).then((img) => {
		return img.resize(250, 250);
	});
	const fileName = `${_id}_${originalname}`;
	const resultPath = path.join(avatarsDir, fileName);
	await fs.rename(tempPath, resultPath);

	const avatarURL = path.join('avatars', fileName);
	await User.findOneAndUpdate(_id, { avatarURL });
	res.status(201).json({ avatarURL });
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	current: ctrlWrapper(current),
	logout: ctrlWrapper(logout),
	changeAvatar: ctrlWrapper(changeAvatar),
	verifyEmail: ctrlWrapper(verifyEmail),
	resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
