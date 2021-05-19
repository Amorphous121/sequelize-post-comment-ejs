const { DataTypes } = require("sequelize");


module.exports = (sequelize) => {
    const Role = sequelize.define('role', {
        name : {
            type : DataTypes.STRING,
            allowNull : false
        }
    }, {
        timestamps: false
    })
    return Role;
}