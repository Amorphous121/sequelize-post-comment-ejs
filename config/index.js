require('dotenv').config();

module.exports = {
    appSecrets : {
        mail : process.env.MAIL,
        password : process.env.MAILPASSWORD,
        jwt : process.env.TOKEN_SECRET
    }
}