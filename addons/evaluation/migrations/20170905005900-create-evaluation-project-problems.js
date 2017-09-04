module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('evaluationProjectProblems', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            projectId: {
                allowNull: false,
                type: Sequelize.STRING
            },
            isOccurred: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                default: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }, {
            engine: process.env.NODE_ENV === 'test' ? 'MYISAM' : 'InnoDB',
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('evaluationProjectProblems');
    }
};

