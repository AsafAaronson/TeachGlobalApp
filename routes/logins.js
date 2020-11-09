const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const asyncHandle = require('../middlware/asyncHandle');
const { User } = require('../models/user');

const router = express.Router();

router.post(
    '/',
    asyncHandle(async (req, res) => {
        let login = validate(req.body);
        if (login.error)
            return res.status(400).send(user.error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('Invalid email or password');

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).send('Invalid email or password');

        const token = await user.generateAuthToken();
        res.cookie('access_token', token, { maxAge: 3600, httpOnly: true });
        res.status(200).end();
        // res.header('x-auth-token', token).send('Login completed');
    })
);

router.post(
    '/logout',
    asyncHandle(async (req, res) => {
        res.header('x-auth-token', '').send('Logout completed');
    })
);

const validate = (login) => {
    const scheme = Joi.object({
        email: Joi.string().email().max(255).min(5).required(),
        password: Joi.string().min(6).max(30).required(),
    });

    return scheme.validate(login);
};

module.exports = router;
