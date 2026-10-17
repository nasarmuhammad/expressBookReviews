const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username &&
        user.password === password
    );
};

// Task 7: Login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const accessToken = jwt.sign(
        { username },
        req.app.get('jwtSecret'),
        { expiresIn: '1h' }
    );

    req.session.authorization = {
        accessToken,
        username
    };

    req.session.save((err) => {
        if (err) {
            return res.status(500).json({
                message: 'Unable to save login session'
            });
        }

        return res.status(200).json({
            message: 'User successfully logged in'
        });
    });
});

// Task 8: Add or modify the logged-in user's review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const review = req.query.review ?? req.body?.review;

    if (typeof review !== 'string' || !review.trim()) {
        return res.status(400).json({
            message: 'A non-empty review is required'
        });
    }

    const username = req.user.username;
    const existed = Object.prototype.hasOwnProperty.call(
        book.reviews,
        username
    );

    book.reviews[username] = review.trim();

    return res.status(200).json({
        message: existed
            ? 'Review successfully modified'
            : 'Review successfully added',
        reviews: book.reviews
    });
});

// Task 9: Delete only the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const username = req.user.username;

    if (!Object.prototype.hasOwnProperty.call(
        book.reviews,
        username
    )) {
        return res.status(404).json({
            message: 'No review found for this user'
        });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: 'Review successfully deleted',
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
