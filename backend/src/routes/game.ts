import { Router } from 'express';
import { submitCode, getAttemptsForLevel, buildHistory } from '../controllers/gameController';

const router = Router();

router.post('/submit', submitCode);
router.get('/attempts/:playerId/:levelNumber', getAttemptsForLevel);
router.get('/history/:playerId/:levelNumber', buildHistory);

export default router;
