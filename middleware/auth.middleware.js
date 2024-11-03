const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, 'secretKey', (err, user) => { // Replace 'your_jwt_secret' with your actual secret
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user; // Set the user information to req.user
        next();
    });
};

module.exports = authenticateJWT;
