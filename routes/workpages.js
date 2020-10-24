const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const config = require('config');
const asyncHandle = require('../middlware/asyncHandle');
const auth = require('../middlware/auth');
const adminAuth = require('../middlware/adminAuth');
const { Workpage, validate } = require('../models/workpage');
const { User } = require('../models/user');
const { getSortMode, getCriteria } = require('../utils/cardBatch');

const router = express.Router();
Fawn.init(mongoose, 'OJLINTTASKCOLLECTION 2');

// get cards (query: sortmode (0-3), searchWords [], batchesPresent (0-))
router.get(
    '/cards',
    auth,
    asyncHandle(async (req, res) => {
        const sortMode = getSortMode(req.query.sortMode);
        const criteria = getCriteria(req.query.searchWords);
        const batchSize = config.get('cardBatchSize');
        const toSkip = req.query.batchesPresent * batchSize;

        let workpages = await Workpage.find(criteria)
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
                photos: 1,
            });
        res.status(200).send(workpages);
    })
);
//get workpage
router.get(
    '/:id',
    auth,
    asyncHandle(async (req, res) => {
        const workpage = await Workpage.find({ _id: req.params.id });
        res.send(workpage);
    })
);
//create new workpage
router.post(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        let workpage = validate(req.body);
        if (workpage.error)
            return res.status(400).send(workpage.error.details[0].message);

        author = await User.findOne({ _id: req.body.author }); 
        if (!author)
            return res
                .status(400)
                .send(`User not found by this Author id: ${req.body.author}`);

        workpage = new Workpage({
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            author: req.body.author,
            cardPhotoUrl: req.body.photos[0],
            photos: req.body.photos,
        })

        const task = Fawn.Task();
        task.update(
            User,
            { _id: req.body.author },
            { $push: { workpages: workpage._id } }
        )
            .save('workpages', workpage)
            .run({ useMongoose: true });

        res.send(`Workpage Created: ${workpage.title}`);
    })
);
//toggle like on a workpage
router.post(
    '/like/:id',
    auth,
    asyncHandle(async (req, res) => {
        const user = await User.findOne({ _id: req.user._id });
        const task = Fawn.Task();
        if (user.workpagesLiked.includes(req.params.id)) {
            task.update(
                User,
                { _id: req.user._id },
                { $pull: { workpagesLiked: req.params.id } }
            );
            task.update(
                Workpage,
                { _id: req.params.id },
                { $inc: { likes: -1 } }
            );
            task.run({ useMongoose: true });
            res.send(`Workpage Unliked: ${req.params.id}`);
        } else {
            task.update(
                User,
                { _id: req.user._id },
                { $push: { workpagesLiked: req.params.id } }
            );
            task.update(
                Workpage,
                { _id: req.params.id },
                { $inc: { likes: 1 } }
            );
            task.run({ useMongoose: true });
            res.send(`Workpage Liked: ${req.params.id}`);
        }
    })
);
//toggle Done on a workpage
router.post(
    '/done/:id',
    auth,
    asyncHandle(async (req, res) => {
        const user = await User.findOne({ _id: req.user._id });
        if (user.workpagesDone.includes(req.params.id)) {
            await User.updateOne(
                { _id: req.user._id },
                { $pull: { workpagesDone: req.params.id } }
            );
            res.send(`Workpage marked as Undone: ${req.params.id}`);
        } else {
            await User.updateOne(
                { _id: req.user._id },
                { $push: { workpagesDone: req.params.id } }
            );
            res.send(`Workpage marked as Done: ${req.params.id}`);
        }
    })
);

module.exports = router;
