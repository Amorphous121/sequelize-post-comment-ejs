const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('post', {
        title : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                len : [3, 150],
            }
        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
            validate : {
                len : [3, 500]
            }
        },
        deletedBy : {
            type : DataTypes.INTEGER,
            defaultValue : null,
        }
    }, {
        paranoid : true
    })

    return Post;
}