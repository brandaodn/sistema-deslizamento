const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET não definido');
}

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'movmassa.sid';

if (isProduction) {
    app.set('trust proxy', 1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    name: sessionCookieName,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.SESSION_COOKIE_SECURE === 'true' || isProduction
    }
}));

const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const insertionRoutes = require('./routes/insertion.routes');
const editRoutes = require('./routes/edit.routes');
const curationRoutes = require('./routes/curation.routes');
const mapRoutes = require('./routes/map.routes');

const basePath = '/movmassa';

app.use(basePath, authRoutes);
app.use(basePath, menuRoutes);
app.use(basePath, insertionRoutes);
app.use(basePath, editRoutes);
app.use(basePath, curationRoutes);
app.use(basePath, mapRoutes);

app.get('/', (req, res) => {
    res.redirect(basePath);
});

module.exports = { app };