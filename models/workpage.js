const mongoose = require('mongoose');
const Joi = require('joi');

const cardPhotoUrl =
    'https://i.picsum.photos/id/962/200/300.jpg?hmac=wvuv8EVOoNE5J3sBkBx-1wcVHNbgJ_Z1dS98YhnShjM';

const workpageSchema = new mongoose.Schema({
    title: { type: String, maxlength: 24, required: true },
    description: { type: String, maxlength: 255, required: true },
    tags: { type: Array, default: [] },
    likes: { type: Number, default: 0 },
    datePublished: { type: Date, default: Date.now },
    cardPhotoUrl: { type: String, default: cardPhotoUrl },
    // Only needed in Workpage Page:
    photos: { type: Array },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Workpage = new mongoose.model('Workpage', workpageSchema);

const validateWorkpage = (activity) => {
    const scheme = Joi.object({
        title: Joi.string().max(24).min(2).required(),
        description: Joi.string().max(255).min(2).required(),
        tags: Joi.array().max(20).min(1),
        author: Joi.objectId().required(),
        photos: Joi.array().max(20).min(1),
    });

    return scheme.validate(activity);
};

module.exports.Workpage = Workpage;
module.exports.validate = validateWorkpage;
