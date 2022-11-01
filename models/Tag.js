const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection.js");

// Initialize model by extending off Sequelize's Model class
class Tag extends Model {}

// Table definition for a Tag (to be assigned to products)
// Two column definitions
Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tag_name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "tag",
  }
);

module.exports = Tag;
