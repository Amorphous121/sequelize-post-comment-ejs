const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {

    const User = sequelize.define('user', {
        firstName : {
            type : DataTypes.STRING(50),
            allowNull : false,
            validate : {
                is : /^[a-zA-Z\s]+$/i,
                len : [3, 50],
            }
        },
        lastName : {
            type : DataTypes.STRING(50),
            allowNull : false,
            validate : {
                is : /^[a-zA-Z\s]+$/i,
                len : [3, 50],
            }
        },
        email : {
            type : DataTypes.STRING(50),
            allowNull : false,
            validate : {
                isEmail : true,
                len : [5, 50]
            }
        },
        password : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        deletedBy : {
            type : DataTypes.INTEGER,
            defaultValue : null
        },
        fullName : {
            type : DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.lastName}`;
            }
        }
    }, {
        paranoid : true
    });

    User.addHook('beforeCreate', async (user, options) => {
        user.password = await bcrypt.hash(user.password, 10);
    });

    User.prototype.isValidPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    }

    return User;
}
