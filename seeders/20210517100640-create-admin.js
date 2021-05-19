'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
      let password = await bcrypt.hash('admin', 10);
      await queryInterface.bulkInsert('users', [{
        firstName: 'Prathamesh',
        lastName : 'Patil',
        email : 'admin@gmail.com',
        password : password,
        roleId : 1,
        createdAt : new Date(),
        updatedAt : new Date()
      }], {});

  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.bulkDelete('users', { email : 'admin@gmail.com '}, {});
  }
};
