const express=require('express')
const business=require('./business.js')
const flash = require('./flash.js')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')

const csrfProtection = csrf({ cookie: true });

const app = express();
app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())
let urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(urlencodedParser)
app.use(cookieParser())

app.use(csrfProtection);

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('CSRF token validation failed');
    } else {
        next(err);
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads')); 


app.get('/', (req, res) => {
    res.render('login', { layout: undefined, message: req.query.message });
});

app.get('/login', async (req, res) => {
    let key = req.cookies.session
    let fm = await flash.getFlash(key)
    let sd = undefined

    if (key) {
        sd = await business.getSessionData(key)


    }
    if (!key || sd) {
        res.render('login', { layout: undefined, csrfToken: req.csrfToken(), message: fm })
        return

    }
    res.render('login', { layout: undefined, message: fm })

})

app.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let userType = await business.checkLogin(username, password)
    console.log(userType)
    if (!userType) {
        let key = await business.startSession({ username: "" })
        await flash.setFlashMessage(key.sessionKey, "Invalid Username or password")
        res.cookie('session', key.sessionKey)
        res.redirect('/login')
        return

    }
    let admin = await business.checkAdmin(username, password)
    if (!admin) {
        let session = await business.startSession({ 
            username: userType.username, 
            photo: userType.photo 
        })
        res.cookie('session', session.sessionKey)
        res.redirect(`/dashboard`)

    }
    else{
        let session = await business.startSession({ username: username })
        res.cookie('session', session.sessionKey)
        res.redirect(`/admin`)
    }
})

// this page will take all users info for regestrariont and create an account for them
app.get('/register', async (req, res) => {
    let key = req.cookies.session
    if (!key) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    let fm = await flash.getFlash(key)
    if (!fm) {
        fm = "Create your account"
    }
    res.render('register', {
        layout: undefined,
        csrfToken: req.csrfToken(),
        message: fm
    })
})


app.post('/register', async (req, res) => {
    let key = req.cookies.session
    let username = req.body.name
    let email = req.body.email
    let password = req.body.password
    let pw2 = req.body.password2


    if (!key) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    if (username === "" || email === "" || password === "" || pw2 === "") {
        let key = await business.startSession({ username: "" })
        await flash.setFlashMessage(key.sessionKey, "Please input all data!")
        res.cookie('session', key.sessionKey)
        res.redirect('/register')
        return
    }
    if (password != pw2) {
        let key = await business.startSession({ username: "" })
        await flash.setFlashMessage(key.sessionKey, "Passwords must match!")
        res.cookie('session', key.sessionKey)
        res.redirect('/register')
        return
    }
    else {
        let register = await business.registerUser(username, email, password)
        console.log(register)
        // await business.updateUser(email)
        let key = await business.startSession({ username: "" })
        await flash.setFlashMessage(key.sessionKey, "Your account is created! You can log in now")
        res.cookie('session', key.sessionKey)
        res.redirect('/login')
    }


})

app.get('/dashboard', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    console.log("We are here!!!", session)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    else{
        res.render('dashboard', {
            layout: 'main',
            username: session.data.username,
            photo: session.data.photo // Pass photo path for navbar
        });
    }
})


app.get('/about', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    console.log("We are here!!!", session)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    else{
        res.render('about', { layout: 'main' })
    }
})

app.get('/admin', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    console.log("We are admin!!!", session)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    else{
        res.render('admin_dashboard', { layout: 'admin' })
    }
})


app.get('/sites/add', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    let user = await business.getUser(session.data.username)
    let siteId = user.data.SiteId
    res.render('addSite', { layout: 'admin', siteId: siteId })

})

app.post('/add-site/:siteId', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }

    let siteId = Number(req.params.siteId)
    
    let name = req.body.name
    let location = req.body.location
    let water = Number(req.body.water)
    let food = Number(req.body.food)
    


    await business.processSiteForm(siteId, name, location, water, food)
   
    res.redirect('/admin_dashboard')
})

app.get('/sites/edit/:siteId', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }

    let siteId = Number(req.params.siteId)
    let oneSite = await business.getOneSiteData(siteId)
    

    res.render('edit_one_site', { site: oneSite, layout: 'admin' })
})

app.post('/sites/:siteId/edit', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)
    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    let siteId = Number(req.params.siteId)
    
    let name = req.body.name
    let location = req.body.location
    let water = Number(req.body.water)
    let food = Number(req.body.food)
    


    let sites = await business.updateSite(siteId, name, location, water, food)
    
    res.redirect('/admin_dashboard')


})

app.get('/forgot-password', (req, res) => {

    res.render('forgot-password', { layout: undefined });
});

app.post('/forgot-password', async (req, res) => {
    let email = req.body.email;
    await business.generateAndStoreResetKey(email);
    await test.testmail(email)

    let session = await business.startSession({ username: "" })
    await flash.setFlashMessage(session.sessionKey, "The password reset link has been sent to your email.")
    res.cookie('session', session.sessionKey)
    res.redirect('/login')

});

app.get('/reset-password', async (req, res) => {
    let resetKey = req.query.key;
    let key = req.cookies.session


    let resest = await business.getUserByResetKey(resetKey)
    // console.log(resest)
    console.log(resetKey)
    if (resetKey != resest.resetKey) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Invalid or expired password reset key")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return;
    }

    let message = await flash.getFlash(key)
    res.render('reset_password', {
        resetKey: resetKey,
        message: message,
        layout: undefined
    });
});

app.post('/reset-password', async (req, res) => {
    let key = req.cookies.session

    let resetKey = req.body.resetKey;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    console.log(resetKey)
    // Check that the password and confirmation match
    if (newPassword !== confirmPassword) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Passwords do not match.")
        res.cookie('session', session.sessionKey)
        res.redirect('/reset-password')
        return;
    }


    let user = await business.getUserByResetKey(resetKey);
    console.log(user)
    if (!user.resetKey) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Invalid or expired password reset key.")
        res.cookie('session', session.sessionKey)
        res.redirect('/reset-password')
        return;

    }

    await business.resetPassword(user.Username, newPassword);
    await business.removeResetKey(user.Username, resetKey);

    await flash.setFlashMessage(key, "message=Password successfully changed")

    res.redirect('/login');

});

app.post('/logout', async (req, res) => {
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }
    let user = await business.getOneStationData(sessionId);

    if (!user) {
        let key = await business.startSession({ username: "" })
        await flash.setFlashMessage(key.sessionKey, "You Logged out!")
        res.cookie('session', key.sessionKey)
        res.redirect('/login')
        return
    }

    await business.deleteSession(sessionId);
    res.clearCookie("session");
    return res.redirect("/login");
})

app.get('/profile', async (req, res) => {
    let key = req.cookies.session
    let session = await business.getSessionData(key)

    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/')
        return
    }
    let message = await flash.getFlash(session.sessionKey);

    let user = await business.getUser(session.data.username);
    if (session.data.userType == 'manager') {
        res.render('profile', { user: user, layout: 'manager', message: message });

    }
    else if (session.data.userType == 'admin') {
        res.render('profile', { user: user, layout: 'admin', message: message });

    }
    else {
        res.render('profile', { user: user, message: message });

    }
});
// profile updates
app.post('/profile', async (req, res) => {
    let key = req.cookies.session;
    let session = await business.getSessionData(key);

    if (!key || !session) {
        let session = await business.startSession({ username: "" })
        await flash.setFlashMessage(session.sessionKey, "Please Login")
        res.cookie('session', session.sessionKey)
        res.redirect('/login')
        return
    }

    // let user = await business.getUser(session.data.username)
    let userName = session.data.username;
    let newUsername = req.body.Username
    let password = req.body.Password
    let email = req.body.email
    console.log(phone)

    await business.updateUserProfile(userName, newUsername, password,email);


    await business.updateSessionforUser(key, { username: newUsername });
    await flash.setFlashMessage(key, "Profile updated successfully.");


    res.redirect('/profile');
});


app.get("/not-found", function (req, res) {
    return res.render("404", { layout: undefined });
});

app.get("*", function (req, res) {
    return res.redirect("/not-found");
});

app.listen(8000, () => { console.log("Running")})