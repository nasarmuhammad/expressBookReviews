const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.set(
    'jwtSecret',
    process.env.JWT_SECRET || 'book-review-local-lab-jwt-secret'
);

app.use('/customer', session({
    secret: process.env.SESSION_SECRET ||
        'book-review-local-lab-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000
    }
}));

// Verify JWT before allowing review changes
app.use('/customer/auth', (req, res, next) => {
    const header = req.headers.authorization || '';

    const bearerToken = header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    const sessionToken =
        req.session?.authorization?.accessToken;

    const token = bearerToken || sessionToken;

    if (!token) {
        return res.status(401).json({
            message: 'Login required'
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            req.app.get('jwtSecret')
        );

        req.user = { username: decoded.username };
        return next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired authentication token'
        });
    }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
