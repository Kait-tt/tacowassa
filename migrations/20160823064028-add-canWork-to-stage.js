'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'stages',
        'canWork',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false
        }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'stages',
        'canWork'
    );
  }
};