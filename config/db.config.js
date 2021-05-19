require('dotenv').config();

module.exports = {
    DB : process.env.DB,
    USER : process.env.USER,
    PASSWORD : process.env.PASSWORD,
    DIALECT : process.env.DIALECT,
    HOST  : process.env.HOST,
    POOL : {
        max : 5,
        min : 0,
        idle : 10000
    }
}

