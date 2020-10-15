const mongoose = require('mongoose');
const Joi = require('joi');

const activitySchema = new mongoose.Schema({
    title: { type: String, maxlength: 24, required: true },
    description: { type: String, maxlength: 255, required: true },
    tags: { type: Array, default: [] },
    likes: { type: Number, default: 0 },
    datePublished: { type: Date, default: Date.now },
    // Only needed in Activity Page:
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    goals: { type: Array },
    accessories: { type: Array },
    toDo: { type: Array },
    letsDoThis: { type: Array },
    adapt: { type: Array },
    photos: { type: Array },
});

const Activity = new mongoose.model('Activity', activitySchema);

const validateActivity = (activity) => {
    const scheme = Joi.object({
        title: Joi.string().max(24).min(2).required(),
        description: Joi.string().max(255).min(2).required(),
        tags: Joi.array().max(20).min(1),
        author: Joi.objectId().required(),
        goals: Joi.array().max(10).min(1),
        accessories: Joi.array().max(10),
        toDo: Joi.array().max(10),
        letsDoThis: Joi.array().max(10).min(1),
        adapt: Joi.array().max(10),
        photos: Joi.array().max(10),
    });

    return scheme.validate(activity);
};

module.exports.Activity = Activity;
module.exports.validate = validateActivity;
