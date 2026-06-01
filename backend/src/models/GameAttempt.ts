import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface GameAttemptAttributes {
  id: number;
  playerId: number;
  levelNumber: number;
  attemptNumber: number;
  codeSubmitted: string;
  aiResponse: string;
  score: number | null;
  passed: boolean;
  timeElapsedSeconds: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GameAttemptCreationAttributes extends Optional<GameAttemptAttributes, 'id' | 'createdAt' | 'updatedAt' | 'score'> {}

class GameAttempt extends Model<GameAttemptAttributes, GameAttemptCreationAttributes> implements GameAttemptAttributes {
  public id!: number;
  public playerId!: number;
  public levelNumber!: number;
  public attemptNumber!: number;
  public codeSubmitted!: string;
  public aiResponse!: string;
  public score!: number | null;
  public passed!: boolean;
  public timeElapsedSeconds!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GameAttempt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'player_id',
      references: {
        model: 'players',
        key: 'id',
      },
    },
    levelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'level_number',
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'attempt_number',
    },
    codeSubmitted: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'code_submitted',
    },
    aiResponse: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_response',
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    timeElapsedSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'time_elapsed_seconds',
    },
  },
  {
    sequelize,
    tableName: 'game_attempts',
    underscored: true,
  }
);

export default GameAttempt;
