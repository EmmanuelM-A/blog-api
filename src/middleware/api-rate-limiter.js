const rateLimit = require('express-rate-limit');
const { settings } = require('../config/configs');

const { WINDOW_MS, GLOBAL_MAX, AUTH_MAX } = settings.rateLimit;

const limiter = rateLimit({
    windowMs: WINDOW_MS,
    max: GLOBAL_MAX,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: AUTH_MAX,
    message: 'Too many attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { limiter, authLimiter };
