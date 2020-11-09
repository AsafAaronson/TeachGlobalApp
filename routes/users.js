const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const winston = require('winston');
const { User, validate, updateValidate } = require('../models/user');
const asyncHandle = require('../middlware/asyncHandle');
const auth = require('../middlware/auth');
const adminAuth = require('../middlware/adminAuth');

const router = express.Router();

//Get self info
router.get(
    '/me',
    auth,
    asyncHandle(async (req, res) => {
        const selector = req.user.isAdmin ? '' : '-isAdmin';
        const user = await User.findOne({ _id: req.user._id }).select(selector);
        res.send(user);
    })
);
//Update user info
router.put(
    '/:id',
    auth,
    asyncHandle(async (req, res) => {
        let body = req.body;
        let user = updateValidate(body);
        if (user.error)
            return res.status(400).send(user.error.details[0].message);

        if (req.user._id != req.params.id && !req.user.isAdmin) {
            winston.info(
                'Access Denied, unauthorized user tried to update user'
            );
            return res.status(403).send('Access Denied');
        }

        if (body.isAdmin && !req.user.isAdmin) {
            winston.info(
                'Access Denied, unauthorized user tried to change isAdmin'
            );
            return res.status(403).send('Access Denied');
        }

        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(body.password, salt);
        }

        await User.updateOne({ _id: req.params.id }, { $set: body });
        res.send('User updated succesfully');
    })
);
// get user by id (gets more info if you are an admin)
router.get(
    '/:id',
    auth,
    asyncHandle(async (req, res) => {
        const user = await User.findOne({ _id: req.params.id });
        let attributes = [
            'name',
            'contactInfo',
            'photoUrl',
            'activities',
            'workpages',
            'activitiesLiked',
            'workpagesLiked',
        ];
        if (req.user.isAdmin) {
            attributes.push('isAdmin');
        }

        if (!user.hideEmail || req.user.isAdmin) {
            attributes.push('email');
        }

        res.send(_.pick(user, attributes));
    })
);
//create new user 
router.post(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        let user = validate(
            _.pick(req.body, ['name', 'email', 'password', 'repeatPassword'])
        );
        if (user.error)
            return res.status(400).send(user.error.details[0].message);

        user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send('This email is already used');

        user = new User(
            _.pick(req.body, [
                'name',
                'email',
                'password',
                'hideEmail',
                'photoUrl',
                'photoUrlMini',
                'contactInfo',
            ])
        );
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        res.status(200).send(`User created successfully`);
        winston.info(`User Created: id: ${user._id} email: ${user.email}`);
    })
);
//delete user 
router.delete(
    '/:id',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        const result = await User.findOneAndDelete({ _id: req.params.id });
        res.send(`User Deleted: id: ${result._id} email: ${result.email}`);
        winston.info(`User Deleted: id: ${result._id} email: ${result.email}`);
    })
);
//get all users 
router.get(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        const result = await User.find({}).select({ name: 1, email: 1, _id: 1 });
        res.send(result);
    })
);

module.exports = router;
