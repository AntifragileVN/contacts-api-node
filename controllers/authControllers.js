const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const Jimp = require('jimp');

const fs = require('fs/promises');
const path = require('path');

const { User } = require('../models/user.js');
const { ctrlWrapper, HttpError } = require('../helpers');

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email already in use');
	}

	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const avatarURL = gravatar.url(email);
	console.log('avatarURL ->', avatarURL);

	const newUser = await User.create({
		...req.body,
		password: hashedPassword,
		avatarURL,
	});

	res.status(201).json({
		email: newUser.email,
		subscription: newUser.subscription,
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password invalid');
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
};
