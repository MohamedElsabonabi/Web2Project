const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const business = require('./business');

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

// Registration route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    await business.registerUser(username, email, password);
    res.redirect('/?message=Registration successful, please log in.');
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isAuthenticated = await business.checkLogin(username, password);

    if (isAuthenticated) {
        const sessionKey = await business.startSession(username);
        res.cookie('sessionKey', sessionKey, { httpOnly: true });
        res.redirect(`/dashboard?username=${username}`);
    } else {
        res.render('login', { layout: undefined, message: "Invalid Username or Password. Try again!" });
    }
});

// Standard user dashboard
app.get('/dashboard', async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    const sessionData = await business.getSessionData(sessionKey);

    if (!sessionData || sessionData.expiry < new Date()) {
        res.redirect('/?message=Session expired. Please log in again.');
    } else {
        res.render('dashboard', { layout: undefined, username: sessionData.data.username });
    }
});

// Logout route
app.post('/logout', async (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    await business.deleteSession(sessionKey);
    res.clearCookie('sessionKey');
    res.redirect('/');
});

app.listen(8000, () => {
    console.log("App is running")
})
