const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection.js");

// Initialize model by extending off Sequelize's Model class
class Category extends Model {}

// Table definition for a category
// Two column definitions
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "category",
  }
);

module.exports = Category;
