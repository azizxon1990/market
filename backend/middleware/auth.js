const jwt = require('jsonwebtoken');
const config = require('../config/envConfig');

const auth = (req, res, next) => {
    console.log(req.headers);
    
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
        return res.status(401).send({ error: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Authentication required token' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Invalid token' });
    }
};

module.exports = auth;
