import sequelize from '../config/database';
import { Player, Level, GameAttempt, PlayerBadge } from '../models';

async function migrate() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('📦 Running migrations...');
    await sequelize.sync({ force: false, alter: true });

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
