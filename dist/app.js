// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const business = require('./business.js'); // Import business logic

const app = express();
const handlebars = require('express-handlebars');

// Set up Handlebars
app.set('views', __dirname + "/templates");
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// CSRF Protection Middleware
app.use(csurf({ cookie: true }));
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken(); // Pass CSRF token to all views
    next();
});

app.get('/', (req, res) => {
    res.render('login', { layout: undefined, message: req.query.message });
});

app.post('/', async (req, res) => {
    const { username, password } = req.body;
    const userType = await business.checkLogin(username, password);

    if (userType) {
        const sessionKey = await business.startSession({ Username: username, Type: userType });
        const session = await business.getSessionData(sessionKey);
        res.cookie('sessionKey', session.SessionKey, { expires: session.Expiry });
        
        if (userType === 'admin') {
            res.redirect(`/admin?Username=${username}`);
        } else {
            res.redirect(`/standard?Username=${username}`);
        }
    } else {
        res.render('login', { layout: undefined, message: "Invalid Username or Password. Try again!" });
    }
});

app.get('/standard', async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    const sessionData = await business.getSessionData(sessionKey);

    if (!sessionData || sessionData.Expiry < new Date()) {
        res.redirect('/?message=Session expired. Please log in again.');
    } else if (sessionData.Data.Type !== 'standard') {
        res.redirect('/?message=Unauthorized access.');
    } else {
        res.render('standard_landing', { layout: undefined, username: sessionData.Data.Username });
    }
});

app.get('/admin', async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    const sessionData = await business.getSessionData(sessionKey);

    if (!sessionData || sessionData.Expiry < new Date()) {
        res.redirect('/?message=Session expired. Please log in again.');
    } else if (sessionData.Data.Type !== 'admin') {
        res.redirect('/?message=Unauthorized access.');
    } else {
        res.render('admin_landing', { layout: undefined, username: sessionData.Data.Username });
    }
});

app.post('/logout', async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    await business.deleteSession(sessionKey);
    res.clearCookie('sessionKey');
    res.redirect('/');
});

module.exports = app;
