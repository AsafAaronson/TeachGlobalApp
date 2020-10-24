const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const config = require('config');
const asyncHandle = require('../middlware/asyncHandle');
const auth = require('../middlware/auth');
const adminAuth = require('../middlware/adminAuth');
const { Activity, validate } = require('../models/activity');
const { User } = require('../models/user');
const { getSortMode, getCriteria } = require('../utils/cardBatch');

const router = express.Router();
Fawn.init(mongoose);

// get cards (query: sortmode (0-3), searchWords [], batchesPresent (0-))
router.get(
    '/cards',
    auth,
    asyncHandle(async (req, res) => {
        const sortMode = getSortMode(req.query.sortMode);
        const criteria = getCriteria(req.query.searchWords);
        const batchSize = config.get('cardBatchSize');
        const toSkip = req.query.batchesPresent * batchSize;

        let activities = await Activity.find(criteria)
            .skip(toSkip)
            .sort(sortMode)
            .limit(batchSize)
            .select({
                title: 1,
                description: 1,
                tags: 1,
                datePublished: 1,
                likes: 1,
                _id: 1,
            });
        res.status(200).send(activities);
    })
);
// get activity
router.get(
    '/:id',
    auth,
    asyncHandle(async (req, res) => {
        const activity = await Activity.find({ _id: req.params.id });
        res.send(activity);
    })
);
// create new activity
router.post(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        let activity = validate(req.body);
        if (activity.error)
            return res.status(400).send(activity.error.details[0].message);

        author = await User.findOne({ _id: req.body.author });
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
//toggle like on an activity
router.post(
    '/like/:id',
    auth,
    asyncHandle(async (req, res) => {
        const user = await User.findOne({ _id: req.user._id });
        const task = Fawn.Task();
        if (user.activitiesLiked.includes(req.params.id)) {
            task.update(
                User,
                { _id: req.user._id },
                { $pull: { activitiesLiked: req.params.id } }
            );
            task.update(
                Activity,
                { _id: req.params.id },
                { $inc: { likes: -1 } }
            );
            task.run({ useMongoose: true });
            res.send(`Activity Unliked: ${req.params.id}`);
        } else {
            task.update(
                User,
                { _id: req.user._id },
                { $push: { activitiesLiked: req.params.id } }
            );
            task.update(
                Activity,
                { _id: req.params.id },
                { $inc: { likes: 1 } }
            );
            task.run({ useMongoose: true });
            res.send(`Activity Liked: ${req.params.id}`);
        }
    })
);
//toggle Done on an activity
router.post(
    '/done/:id',
    auth,
    asyncHandle(async (req, res) => {
        const user = await User.findOne({ _id: req.user._id });
        if (user.activitiesDone.includes(req.params.id)) {
            await User.updateOne(
                { _id: req.user._id },
                { $pull: { activitiesDone: req.params.id } }
            );
            res.send(`Activity marked as Undone: ${req.params.id}`);
        } else {
            await User.updateOne(
                { _id: req.user._id },
                { $push: { activitiesDone: req.params.id } }
            );
            res.send(`Activity marked as Done: ${req.params.id}`);
        }
    })
);
module.exports = router;
