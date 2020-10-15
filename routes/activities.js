const express = require('express');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const asyncHandle = require('../middlware/asyncHandle');
const auth = require('../middlware/auth');
const adminAuth = require('../middlware/adminAuth');
const { Activity, validate } = require('../models/activity');
const { User } = require('../models/user');

const router = express.Router();
Fawn.init(mongoose);

// get cards
router.get(
    '/',
    auth,
    asyncHandle(async (req, res) => {
        let sortBy = [{likes: 1},{datePublished:1}]
        let activities = await Activity.find({}).limit(10).select({
            title: 1,
            description: 1,
            tags: 1,
            datePublished: 1,
            likes: 1,
        });
        res.status(200).send(activities);
    })
);

router.post(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        let activity = validate(req.body);
        if (activity.error)
            return res.status(400).send(activity.error.details[0].message);

        author = await User.findOne({ _id: req.body.author }); // change to userid from token
        if (!author)
            return res
                .status(400)
                .send(`User not found by this Author id: ${req.body.author}`);

        activity = new Activity(req.body);

        const task = Fawn.Task();
        task.update(
            User,
            { _id: req.body.author },
            { $push: { activities: activity._id } }
        )
            .save('activities', activity)
            .run({ useMongoose: true });

        res.send(`Activity Created: ${activity.title}`);
    })
);

module.exports = router;
