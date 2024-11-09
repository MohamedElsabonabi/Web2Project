const mongodb = require('mongodb');

let client = undefined
let db = undefined
let users = undefined
let session = undefined

async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://60096908:12ADMIN34@cluster0.gnn0wn1.mongodb.net/');
        await client.connect();
        db = client.db('Project3');
        users = db.collection('Users');
        session=db.collection('Session')
    }
}

async function getUserDetails(username) {

    await connectDatabase()
    let db = client.db('Project3')
    let users = db.collection('Users')
    let result = await users.find({ username: username })
    let resultData = await result.toArray()
    return resultData
  }

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

async function getSessionData(key) {
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    let result = await session.find({ sessionKey: key })
    let resultData = await result.toArray()
    return resultData[0]
  }

async function deleteSession(key) {
    await connectDatabase()
    let db = client.db('Project3')
    let session = db.collection('Session')
    let result = await session.deleteOne({ sessionKey: key })
    return result
  }


module.exports = {
    getUserDetails,
    registerUser,
    saveSession,
    getSessionData,
    deleteSession
};