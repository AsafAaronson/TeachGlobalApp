const jwt = require('jsonwebtoken');
const config = require('config');




module.exports = function (req, res, next) {
    const token  = req.cookies.access_token
    console.log()
    if (!token) {
        return res.status(401).send('Access Denied. No token provided');
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
