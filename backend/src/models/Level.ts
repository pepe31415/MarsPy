import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LevelAttributes {
  id: number;
  levelNumber: number;
  objetivoDidactico: string | null;
  title: string;
  scenarioDescription: string;
  scenarioSpeech: string | null;
  initialCode: string;
  backgroundImage: string;
  aiPromptTemplate: string;
  isLast: boolean;
  threshold: number;
  nextLevelIfPass: number | null;
  nextLevelIfFail: number | null;
  badgeThresholdImage?: string | null;
  badgeThresholdName?: string | null;
  badgeCompletionImage?: string | null;
  badgeCompletionName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LevelCreationAttributes extends Optional<LevelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Level extends Model<LevelAttributes, LevelCreationAttributes> implements LevelAttributes {
  public id!: number;
  public levelNumber!: number;
  public objetivoDidactico!: string | null;
  public title!: string;
  public scenarioDescription!: string;
  public scenarioSpeech!: string | null;
  public initialCode!: string;
  public backgroundImage!: string;
  public aiPromptTemplate!: string;
  public isLast!: boolean;
  public threshold!: number;
  public nextLevelIfPass!: number | null;
  public nextLevelIfFail!: number | null;
  public badgeThresholdImage!: string | null;
  public badgeThresholdName!: string | null;
  public badgeCompletionImage!: string | null;
  public badgeCompletionName!: string | null;
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
    objetivoDidactico: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      field: 'objetivo_didactico',
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
    scenarioSpeech: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'scenario_speech',
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
    badgeThresholdImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'badge_threshold_image',
    },
    badgeThresholdName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null,
      field: 'badge_threshold_name',
    },
    badgeCompletionImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'badge_completion_image',
    },
    badgeCompletionName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null,
      field: 'badge_completion_name',
    },
  },
  {
    sequelize,
    tableName: 'levels',
    underscored: true,
  }
);

export default Level;
