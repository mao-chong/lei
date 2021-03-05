const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decondedToken = jwt.verify(token, "secret_this_should_be_longer");
        req.userData = { email: decondedToken.email, userId: decondedToken.userId }
        next()
    } catch (error) {
        res.status(401).json({ message: "You are not authenticated!" })
    }

} 