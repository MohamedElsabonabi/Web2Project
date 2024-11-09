const persistence = require('./persistence');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Function to register a new user
async function registerUser(name, email, password) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    await persistence.registerUser(name, email, hashedPassword);
}

// Function to check login credentials
async function checkLogin(username, password) {
    const user = await persistence.getUserDetails(username);
    if (user.length > 0 && await bcrypt.compare(password, user[0].password)) {
        return true;
    }
    return false;
}

// Function to start a new session
async function startSession(username) {
    const sessionKey = crypto.randomBytes(16).toString('hex');
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Save session data
    const sessionData = {
        username: username,
        type: 'standard' // Adjust based on user type if necessary
    };
    await persistence.saveSession(sessionKey, expiryDate, sessionData);
    return sessionKey;
}

// Function to retrieve session data
async function getSessionData(sessionKey) {
    const sessionData = await persistence.getSessionData(sessionKey);
    if (sessionData && sessionData.expiry > new Date()) {
        return sessionData;
    }
    return null;
}

// Function to delete a session
async function deleteSession(sessionKey) {
    await persistence.deleteSession(sessionKey);
}

module.exports = {
    registerUser,
    checkLogin,
    startSession,
    getSessionData,
    deleteSession
};
