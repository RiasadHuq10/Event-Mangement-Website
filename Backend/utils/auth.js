const jwt = require('jsonwebtoken');

// generate a token
const generateToken = function (user) {
    return jwt.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: 86400 // expires in 24 hours
    });
}

const isAdmin = function (req, res, next) {

    // extra checking
    if (req.user.type != "admin") {
        return res.status(401).send('!Admin');
    }

    next();
};
const isVol = function (req, res, next) {

    // extra checking
    if (req.user.type != "volunteer") {
        return res.status(401).send('!Volunteer');
    }

    next();
};
const isUser = function (req, res, next) {

    // extra checking
    if (req.user.type != "volunteer" && req.user.type != "admin") {
        res.status(401).send('Unauthorized: Not Volunteer');
    }

    next();
};
module.exports = { generateToken, isAdmin,isVol,isUser };

