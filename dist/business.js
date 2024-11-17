const persistence = require("./persistence.js");
const crypto = require("crypto")

async function registerUser(username, email, password) {
    return await persistence.registerUser(username, email, password);
}

// This function will return the type of user that attempted to log in.  If the username/password
// is incorrect the function returns undefined.
async function checkLogin(username, password) {


    let data = await persistence.getUserDetails(username)

    for(c of data){
        console.log(c.username)
        if (c.username == username&& c.password == password) {
            return true
        }
    }
    
    return undefined
}
async function updateUser(email) {
    return await persistence.updateApproval(email)
}

async function updateUserID(sid,newSid){
    return await persistence.updateUser(sid, newSid)
}

// the functionwill return the user data by their name
async function getUser(username) {
    let user = await persistence.getUserDetails(username)
   
    return user[0]
}

async function checkAdmin(username, password) {


    let data = await persistence.getAdminDetails(username, password)

    for(c of data){
        console.log("Admin", c.admin)
        if (c.admin) {
            return true
        }
    }
    
    return undefined
}
// the functionwill return the user data by their name
async function getUser(username) {
    let user = await persistence.getUserDetails(username)
   
    return user[0]
}

async function findUserById(sid){
    return await persistence.findUserById(sid)
}

// check for session if it's authenticated
async function isAuthenticated(sessionKey) {
    let sd = await getSessionData(sessionKey)
    if (!sessionKey) {
        return false
    }
    if (sd && sd.data.username != "") {
        return true
    }
    return false
}

// create user account
async function registerUser(name, email, password) {

    return await persistence.registerUser(name, email, password)
}

// async function updateSite(siteId, water, food){
//     let added = {
//         siteId : siteId,
//         water: water,
//         food: food
//     }
//     await persistence.updateSite(added)
// }

// for creating a station
async function processSiteForm(siteId, name, location, water, food) {
    let siteData = {
        siteId: siteId,
        name: name,
        location: location,
        water:water,
        food:food,
    };

    await persistence.saveSiteData(siteData);
}



// Save the data (might be an object) into the persistence.  The expiry time will be 5 minutes from
// the current time.  
async function startSession(data) {
    let uuid = crypto.randomUUID();

    let expiry = new Date(Date.now() + 1000 * 60 * 5)
    let Data = data

    return await persistence.saveSession(uuid, expiry, Data)
}

// return the session data
async function getSessionData(key) {

    return await persistence.getSessionData(key)

}

// delete the session when logout
async function deleteSession(key) {
    return await persistence.deleteSession(key)
}

// update session data for flash message
async function updateSession(sessionKey, data){
    return await persistence.updateSession(sessionKey, data)
}
async function userStID(username){
    return await persistence.userStID(username)
}

// retrun all site data
async function retrieveSiteData() {
   
    return await persistence.getPublicSiteData();
}

// return only one site 
async function getOneSiteData(staId){
    return await persistence.getOneSiteData(staId)
}

// update session when user update their profile
async function updateSessionforUser(sessionKey, data){
    return await persistence.updateSessionforUser(sessionKey, data)
}

// will create reset key
async function generateAndStoreResetKey(email) {

    let resetKey = crypto.randomUUID();
    await persistence.addResetKeyToUser(email, resetKey);
    return resetKey
}

async function getUserByResetKey(key){
    return persistence.getTheresetKey(key)
}

// after creating the reset key, the user can update their password
async function resetPassword(username, newPassword){

    return await persistence.resetPassword(username, newPassword)
}

// remove the reset key from the session after updating the password
async function removeResetKey(username, key){
    let resetKey = await persistence.getTheresetKey(key)
    delete resetKey.resetKey
   
    await persistence.updateUserData(username, resetKey)

}
//profile
// for update user profile
async function updateUserProfile(username,newUser, password, email) {
    let profileData = {
        Username:newUser,
        Password: password,
        Email: email,
    }
    
    return await persistence.updateUserProfile(username, profileData);
}
module.exports = {
    registerUser,
    checkLogin,updateSession,deleteSession,getSessionData,startSession,
    isAuthenticated,findUserById,getUser,userStID,checkAdmin,
    updateUserID, updateUser, processSiteForm, retrieveSiteData,
    getOneSiteData, updateSessionforUser, generateAndStoreResetKey, 
    getUserByResetKey, resetPassword, removeResetKey, updateUserProfile
};