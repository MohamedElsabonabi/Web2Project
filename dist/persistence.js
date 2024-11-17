const mongodb = require('mongodb');

let client = undefined
let db = undefined
let users = undefined
let session = undefined

async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://60098476:55803060@60098476.zzawdyu.mongodb.net/');
        await client.connect();
        db = client.db('Project3');
        users = db.collection('Users');
        session=db.collection('Session')
    }
}

// will return the user data by the name
async function getUserDetails(username) {

    await connectDatabase()
    let db = client.db('Project3')
    let users = db.collection('Users')
    let result = await users.find({ username: username })
    let resultData = await result.toArray()
    return resultData
  }

async function getAdminDetails(username) {

    await connectDatabase()
    let db = client.db('Project3')
    let users = db.collection('Users')
    let result = await users.find({ username: username })
    let resultData = await result.toArray()
    console.log("Persistence check admin: ", resultData)
    return resultData
  }

  // will return the user data by the user id

async function findUserById(sid) {
    await connectDatabase()
    let db = client.db('Project3')
    let users = db.collection('Users')
    let result = await users.findOne({ 'data.SitesId': sid })
    // let resultData = await result.toArray()
  
    return result
  }

  // will update the user sites id to new sites id
async function updateUser(sid, newSid) {
    await connectDatabase()
    let db = client.db('Project3')
    let user = db.collection('Users')
    return await user.updateOne({ 'data.SitesId': sid }, { $set: { 'data.SitesId': newSid } })
  
  }


  // will create a new account for user
async function registerUser(name, email, password) {
  await connectDatabase();
  regusers = db.collection('Users');
  let newUser = {
    username: name,
    password: password,
    email: email,
  }
  await regusers.insertOne(newUser)
}

async function getAllApplications() {
    await connectDatabase();
    regusers = db.collection('register');
    let result = await regusers.find({}).toArray();
    return result
  }

  // will remove the account from register collection and put it in the user collection
async function updateApproval(email) {
    await connectDatabase();
    regUsers = db.collection('register');
    users = db.collection('Users');
    let user = await regUsers.findOne({ email: email });
    if (!user) {
      return undefined
    }
    user.admin = true
    let newUser = {
      Username: user.username,
      Password: user.password,
      Email: user.email,
      Admin: user.admin
    }
    await users.insertOne(newUser)
    await regUsers.deleteOne({ email: email })
  
  
  }

  // creating a new session for every user, and set an expiry date if the session date expired
// the user will be logged out
async function saveSession(uuid, expiry, data) {
    // Session Data
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    let sessionData = {
      sessionKey: uuid,
      expiry: expiry,
      data: data
    }
    await session.insertOne(sessionData)
    return sessionData
  
  }

  // async function addInventory(data) {
  //   await connectDatabase();
  //   let db = client.db('Project3');
  //   let collection = db.collection('Inventory');
  //   await collection.insertOne(data)
  // }

  // will update the food of the site 
async function updateSite(siteId, water, food) {
  await connectDatabase();
  let db = client.db('Project3');
  let collection = db.collection('sites');
  await collection.updateMany({ siteId: siteId }, { $set: { food: food, water: water } })
}
  
  // will return all the sites detatils
async function getPublicSiteData() {
  await connectDatabase();
  let db = client.db('Project3');
  let collection = db.collection('sites');
  let sites = await collection.find({}).toArray();
  return sites.map(site => {
    site.isWaterLow = site.water < 10; // Example if less than 100 then it's running low
    site.isFoodLow = site.food < 10;
    return site;
  });
}

  // will return the session data based on the session key
async function getSessionData(key) {
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    let result = await session.find({ sessionKey: key })
    let resultData = await result.toArray()
    return resultData[0]
  }

  // will return only one site based on that site id
  async function getOneSiteData(siteId) {
    await connectDatabase();
    let db = client.db('Project3');
    let collection = db.collection('sites');
    let site = await collection.findOne({ siteId: siteId })

    return site
  }
  // will update the session data to add the flash message
  async function updateSession(key, sd) {
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    await session.replaceOne({ sessionKey: key }, sd);
  
  }

  async function getSiteData(siteId) {
    await connectDatabase();
    let db = client.db('Project3');
    let collection = db.collection('sites');
    return await collection.find({ siteId: siteId });
  }
  
  // will update the session data(userrname, and user type) when a user update their profile
  async function updateSessionforUser(sessionKey, data) {
    await connectDatabase();
    let db = client.db('Project3');
    let sessionCollection = db.collection('Session');
  
    let updateData = {};
    if (data.username) {
      updateData['data.username'] = data.username;
  
    }
    if (data.admin) {
      updateData['data.admin'] = data.admin;
    }
  
    await sessionCollection.updateOne({ sessionKey: sessionKey }, { $set: updateData });
  }
  
  // will delete the session when users are logged out
  async function deleteSession(key) {
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    let result = await session.deleteOne({ sessionKey: key })
    return result
  }
  
  
  // create reset key when a user forget their password and want to change it
  async function addResetKeyToUser(email, resetKey) {
    await connectDatabase()
    db = client.db('Project3')
    let users = db.collection('Users')
  
    await users.updateOne({ Email: email }, { $set: { resetKey: resetKey } })
  
  }
  
  // return the reset key
  async function getTheresetKey(key) {
    await connectDatabase()
    db = client.db('Project3')
    let users = db.collection('Users')
    let result = await users.findOne({ resetKey: key })
  
    return result
  }
  
  // will update the password to the new one
  async function resetPassword(username, newPassword) {
    await connectDatabase()
    db = client.db('Project3')
    let users = db.collection('Users')
    await users.updateOne({ Username: username }, { $set: { Password: newPassword } })
  }
  
  // uodate user data
  async function updateUserData(username, data) {
    await connectDatabase()
    db = client.db('Project3')
    let users = db.collection('Users')
    await users.replaceOne({ Username: username }, data)
  }
  
  //profile 
  //  will update user profile
  async function updateUserProfile(username, profileData) {
    await connectDatabase();
    let db = client.db('Project3');
    let users = db.collection('Users');
  
    await users.updateOne({ Username: username }, { $set: profileData });
  }
  //
  async function userStID(username) {
    await connectDatabase();
    let database = client.db("Project3");
    let user = database.collection("Users");
    let result = await user.findOne({ Username: username })
  
    return result
  }
  async function saveSiteData(siteData) {
    await connectDatabase()
    let db = client.db('Project3');
    let sitesCollection = db.collection("sites");
  
    let existingSite = await sitesCollection.findOne({ siteId: siteData.siteId });
  
    if (existingSite) {
      // Update existing site data
      return await sitesCollection.updateOne({ _id: existingSite._id }, { $set: siteData });
    } else {
      // Insert new site data
      return await sitesCollection.insertOne(siteData);
    }
  }
  module.exports = {
    getUserDetails, saveSession, getSessionData, deleteSession, registerUser, getAllApplications,
    updateApproval, updateSession,findUserById, updateUser,
    addResetKeyToUser, getTheresetKey, resetPassword, updateUserData, updateUserProfile, updateSessionforUser,
    userStID, getAdminDetails, updateSite, getPublicSiteData,
    getOneSiteData, getSiteData, saveSiteData
  }