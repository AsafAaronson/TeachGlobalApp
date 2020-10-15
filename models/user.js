const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');


const photoUrlMini =
    'https://i.picsum.photos/id/168/50/50.jpg?hmac=RtAs7F6AeB1rYq86K_eM7a8_clT6Vyd8KCJS4Tp5W3A';
const photoUrl =
    'https://i.picsum.photos/id/168/200/200.jpg?hmac=VxnpUGg87Q47YRONmdsU2vNGSPjCs5vrwiAL-0hEIHM';

const userSchema = new mongoose.Schema({
    isAdmin: { type: Boolean, default: false },
    name: { type: String, required: true, maxlength: 255 },
    email: { type: String, required: true, maxlength: 255, unique: true },
    password: { type: String, required: true, maxlength: 255 },
    hideEmail: { type: Boolean, default: false },
    contactInfo: {
        type: String,
        maxlength: 1024,
        default: 'No Contact Info Shared',
    },
    photoUrlMini: {
        type: String,
        maxlength: 1024,
        default: photoUrlMini,
    },
    photoUrl: {
        type: String,
        maxlength: 1024,
        default: photoUrl,
    },
    activities: { type: Array, default: [] },
    activitiesLiked: { type: Array, default: [] },
    activitiesDone: { type: Array, default: [] },
    workpages: { type: Array, default: [] },
    workpagesLiked: { type: Array, default: [] },
    workpagesDone: { type: Array, default: [] },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin },
        config.get("jwtPrivateKey")
    );
    return token;
};

const User = new mongoose.model('User', userSchema);

const validateUser = (user) => {
    const scheme = Joi.object({
        name: Joi.string().max(255).min(5).required(),
        email: Joi.string().email().max(255).min(5).required(),
        password: Joi.string().min(6).max(30).required(),
        repeatPassword: Joi.ref('password'),
        hideEmail: Joi.boolean(),
        contactInfo: Joi.string().max(1024),
        photoUrl: Joi.string().max(1024),
        photoUrlMini: Joi.string().max(1024),
    }).with('password', 'repeatPassword');

    return scheme.validate(user);
};



module.exports.User = User;
module.exports.validate = validateUser;
