import { Router } from 'express';
import { getLevelByNumber, getAllLevels } from '../controllers/levelController';

const router = Router();

router.get('/', getAllLevels);
router.get('/:levelNumber', getLevelByNumber);

export default router;
