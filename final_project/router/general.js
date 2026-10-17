const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { users } = require('./auth_users.js');

const public_users = express.Router();

// Task 6: Register a user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body || {};

    if (typeof username !== 'string' ||
        typeof password !== 'string' ||
        !username.trim() || !password.trim()) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({
            message: 'User already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User successfully registered. Now you can login'
    });
});

// Task 1: Get all books
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Task 2: Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book);
});

// Task 3: Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    const results = Object.fromEntries(
        Object.entries(books).filter(([isbn, book]) =>
            book.author.toLowerCase().includes(author)
        )
    );

    return res.status(200).json(results);
});

// Task 4: Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    const results = Object.fromEntries(
        Object.entries(books).filter(([isbn, book]) =>
            book.title.toLowerCase().includes(title)
        )
    );

    return res.status(200).json(results);
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book.reviews);
});

// Tasks 10-13: Promises and Async/Await using Axios
const BOOK_API_BASE_URL =
    process.env.BOOK_API_BASE_URL || 'http://127.0.0.1:5000';

const axiosOptions = {
    timeout: 5000,
    proxy: false
};

// Task 10: Retrieve ALL books using Async/Await
async function getAllBooks() {
    try {
        const response = await axios.get(
            `${BOOK_API_BASE_URL}/`,
            axiosOptions
        );
        return response.data;
    } catch (error) {
        console.error("getAllBooks failed:", error.message);
        throw error;
    }
}

// Task 11: Retrieve book by ISBN using Promise callbacks
function getBooksByISBN(isbn) {
    return axios.get(
        `${BOOK_API_BASE_URL}/isbn/${encodeURIComponent(isbn)}`,
        axiosOptions
    )
    .then(response => response.data)
    .catch(error => {
        console.error("getBooksByISBN failed:", error.message);
        throw error;
    });
}

// Task 12: Retrieve books by author using Promise callbacks
function getBooksByAuthor(author) {
    return axios.get(
        `${BOOK_API_BASE_URL}/author/${encodeURIComponent(author)}`,
        axiosOptions
    )
    .then(response => response.data)
    .catch(error => {
        console.error("getBooksByAuthor failed:", error.message);
        throw error;
    });
}

// Task 13: Retrieve books by title using Async/Await
async function getBooksByTitle(title) {
    try {
        const response = await axios.get(
            `${BOOK_API_BASE_URL}/title/${encodeURIComponent(title)}`,
            axiosOptions
        );
        return response.data;
    } catch (error) {
        console.error("getBooksByTitle failed:", error.message);
        throw error;
    }
}

// Public Express router and four Axios methods
module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
