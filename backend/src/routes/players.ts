import { Router } from 'express';
import {
  createOrGetPlayer,
  getPlayerByAlias,
  getPlayerProgress,
  getPlayerBadges,
} from '../controllers/playerController';

const router = Router();

router.post('/', createOrGetPlayer);
router.get('/:alias', getPlayerByAlias);
router.get('/:playerId/progress', getPlayerProgress);
router.get('/:playerId/badges', getPlayerBadges);

export default router;
