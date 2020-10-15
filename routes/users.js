const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const winston = require('winston');
const { User, validate } = require('../models/user');
const asyncHandle = require('../middlware/asyncHandle');
const auth = require('../middlware/auth');
const adminAuth = require('../middlware/adminAuth');

const router = express.Router();

router.get(
    '/',
    [auth, adminAuth],
    asyncHandle(async (req, res) => {
        const users = await User.find({}).select({
            name: 1,
            email: 1,
            isAdmin: 1,
        });
        res.send(users);
    })
);

router.post(
    '/',
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
        winston.info(`User named: ${user.name} created successfully`);
    })
);

module.exports = router;
