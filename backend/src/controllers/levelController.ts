import { Request, Response } from 'express';
import Level from '../models/Level';

export const getLevelByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.levelNumber);

    if (isNaN(levelNumber)) {
      res.status(400).json({ error: 'Número de nivel inválido' });
      return;
    }

    const level = await Level.findOne({ where: { levelNumber } });

    if (!level) {
      res.status(404).json({ error: `Nivel ${levelNumber} no encontrado` });
      return;
    }

    res.json(level);
  } catch (error) {
    console.error('getLevelByNumber error:', error);
    res.status(500).json({ error: 'Error al obtener nivel' });
  }
};

export const getAllLevels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const levels = await Level.findAll({ order: [['levelNumber', 'ASC']] });
    res.json(levels);
  } catch (error) {
    console.error('getAllLevels error:', error);
    res.status(500).json({ error: 'Error al obtener niveles' });
  }
};
