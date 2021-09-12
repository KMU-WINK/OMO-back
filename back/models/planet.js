const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Planet extends Model {
  static init(sequelize) {
    return super.init({
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      planetForm: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      }
    }, {
      modelName: 'Planet',
      tableName: 'planets',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      sequelize,
    });
  }
  static associate(db) {
    db.Planet.hasMany(db.Post);
  }
};
