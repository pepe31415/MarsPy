import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LevelAttributes {
  id: number;
  levelNumber: number;
  title: string;
  scenarioDescription: string;
  initialCode: string;
  backgroundImage: string;
  aiPromptTemplate: string;
  isLast: boolean;
  threshold: number;
  nextLevelIfPass: number | null;
  nextLevelIfFail: number | null;
  badgeImage: string;
  badgeName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LevelCreationAttributes extends Optional<LevelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Level extends Model<LevelAttributes, LevelCreationAttributes> implements LevelAttributes {
  public id!: number;
  public levelNumber!: number;
  public title!: string;
  public scenarioDescription!: string;
  public initialCode!: string;
  public backgroundImage!: string;
  public aiPromptTemplate!: string;
  public isLast!: boolean;
  public threshold!: number;
  public nextLevelIfPass!: number | null;
  public nextLevelIfFail!: number | null;
  public badgeImage!: string;
  public badgeName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Level.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    levelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'level_number',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    scenarioDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'scenario_description',
    },
    initialCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'initial_code',
    },
    backgroundImage: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'background_image',
    },
    aiPromptTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_prompt_template',
    },
    isLast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_last',
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    nextLevelIfPass: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'next_level_if_pass',
    },
    nextLevelIfFail: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'next_level_if_fail',
    },
    badgeImage: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '/badges/default.png',
      field: 'badge_image',
    },
    badgeName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: 'Aprendiz',
      field: 'badge_name',
    },
  },
  {
    sequelize,
    tableName: 'levels',
    underscored: true,
  }
);

export default Level;
