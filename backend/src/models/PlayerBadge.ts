import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PlayerBadgeAttributes {
  id: number;
  playerId: number;
  levelNumber: number;
  badgeType: 'threshold' | 'completion';
  badgeImage: string;
  badgeName: string;
  score: number;
  earnedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerBadgeCreationAttributes extends Optional<PlayerBadgeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PlayerBadge extends Model<PlayerBadgeAttributes, PlayerBadgeCreationAttributes> implements PlayerBadgeAttributes {
  public id!: number;
  public playerId!: number;
  public levelNumber!: number;
  public badgeType!: 'threshold' | 'completion';
  public badgeImage!: string;
  public badgeName!: string;
  public score!: number;
  public earnedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlayerBadge.init(
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
    badgeType: {
      type: DataTypes.ENUM('threshold', 'completion'),
      allowNull: false,
      defaultValue: 'completion',
      field: 'badge_type',
    },
    badgeImage: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'badge_image',
    },
    badgeName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'badge_name',
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    earnedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'earned_at',
    },
  },
  {
    sequelize,
    tableName: 'player_badges',
    underscored: true,
  }
);

export default PlayerBadge;
