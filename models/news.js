import { DataTypes, Model } from 'sequelize';
import db from '../config/database.js';
const { sequelize } = db;

export default class News extends Model {}
News.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sourceName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'newsapi'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'news',
  timestamps: false
});

export { News };