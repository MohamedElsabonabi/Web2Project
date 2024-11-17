const persistence = require('./persistence')

async function setFlashMessage(sessionKey, fm){
    let sd = await persistence.getSessionData(sessionKey)
    sd.flash = fm
    return await persistence.updateSession(sessionKey, sd)
    
  
}

async function getFlash(sessionKey){
    let sd = await persistence.getSessionData(sessionKey)
    if(!sd){
        return undefined
    }
    let result = sd.flash
    delete sd.flash
    await persistence.updateSession(sessionKey, sd)
    return result

}

module.exports = {
    setFlashMessage, getFlash
}