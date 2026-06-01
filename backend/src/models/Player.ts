import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PlayerAttributes {
  id: number;
  alias: string;
  currentLevelNumber: number;
  lastCode: string;
  totalScore: number;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: number;
  public alias!: string;
  public currentLevelNumber!: number;
  public lastCode!: string;
  public totalScore!: number;
  public completedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    alias: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    currentLevelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'current_level_number',
    },
    lastCode: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'last_code',
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_score',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    sequelize,
    tableName: 'players',
    underscored: true,
  }
);

export default Player;
