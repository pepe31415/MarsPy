import sequelize from '../config/database';
import { Player, Level, GameAttempt, PlayerBadge } from '../models';

async function reset() {
  try {
    console.log('⚠️  Resetting database (all data will be lost)...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Database reset completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

reset();
