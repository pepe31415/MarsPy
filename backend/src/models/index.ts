import Player from './Player';
import Level from './Level';
import GameAttempt from './GameAttempt';
import PlayerBadge from './PlayerBadge';

// Associations
Player.hasMany(GameAttempt, { foreignKey: 'playerId', as: 'attempts' });
GameAttempt.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

Player.hasMany(PlayerBadge, { foreignKey: 'playerId', as: 'badges' });
PlayerBadge.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

export { Player, Level, GameAttempt, PlayerBadge };
