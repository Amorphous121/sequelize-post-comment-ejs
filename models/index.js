const { Sequelize } = require('sequelize');

const dbConfig = require('../config/db.config');


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host : dbConfig.HOST,
    dialect : dbConfig.DIALECT,
    pool : dbConfig.POOL,
    logging : false
})

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users    = require('./user-model')(sequelize);
db.posts    = require('./post-model')(sequelize);
db.comments = require('./comment-model')(sequelize);
db.roles    = require('./role-model')(sequelize);

/**** Relations */
db.roles.hasOne(db.users);
db.users.belongsTo(db.roles);
db.users.hasMany(db.posts);
db.posts.belongsTo(db.users);
db.users.hasMany(db.comments);
db.comments.belongsTo(db.users);
db.posts.hasMany(db.comments);
db.comments.belongsTo(db.posts);

db.sequelize.sync()
    .then(() => console.log("\n\t Tables synced successfully..  \n"))
    .catch((err) => console.log("\n\t " + err.message));

module.exports = db;