const { DataTypes } = require('sequelize');
const userModel = require('./user-model');

module.exports = (sequelize) => {
    const Comment = sequelize.define('comment', {
        comment : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        deletedBy : {
            type : DataTypes.INTEGER,
            defaultValue : null,
        }
    }, {
        paranoid : true 
    });
    return Comment;
}   