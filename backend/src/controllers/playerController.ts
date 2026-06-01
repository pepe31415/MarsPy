import { Request, Response } from 'express';
import { Player, PlayerBadge, GameAttempt } from '../models';

export const createOrGetPlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias } = req.body;

    if (!alias || alias.trim().length < 2) {
      res.status(400).json({ error: 'El alias debe tener al menos 2 caracteres' });
      return;
    }

    const cleanAlias = alias.trim().toLowerCase();

    const [player, created] = await Player.findOrCreate({
      where: { alias: cleanAlias },
      defaults: {
        alias: cleanAlias,
        currentLevelNumber: 0,
        lastCode: '',
        totalScore: 0,
        completedAt: null,
      },
    });

    res.status(created ? 201 : 200).json({
      player: {
        id: player.id,
        alias: player.alias,
        currentLevelNumber: player.currentLevelNumber,
        lastCode: player.lastCode,
        totalScore: player.totalScore,
        completedAt: player.completedAt,
        createdAt: player.createdAt,
      },
      isNewPlayer: created,
    });
  } catch (error) {
    console.error('createOrGetPlayer error:', error);
    res.status(500).json({ error: 'Error al crear/obtener jugador' });
  }
};

export const getPlayerByAlias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias } = req.params;

    const player = await Player.findOne({
      where: { alias: alias.toLowerCase() },
    });

    if (!player) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }

    res.json({
      id: player.id,
      alias: player.alias,
      currentLevelNumber: player.currentLevelNumber,
      lastCode: player.lastCode,
      totalScore: player.totalScore,
      completedAt: player.completedAt,
      createdAt: player.createdAt,
    });
  } catch (error) {
    console.error('getPlayerByAlias error:', error);
    res.status(500).json({ error: 'Error al obtener jugador' });
  }
};

export const getPlayerProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;

    const player = await Player.findByPk(playerId);
    if (!player) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }

    const attempts = await GameAttempt.findAll({
      where: { playerId },
      order: [['createdAt', 'DESC']],
    });

    const badges = await PlayerBadge.findAll({
      where: { playerId },
      order: [['earnedAt', 'ASC']],
    });

    res.json({
      player: {
        id: player.id,
        alias: player.alias,
        currentLevelNumber: player.currentLevelNumber,
        totalScore: player.totalScore,
        completedAt: player.completedAt,
      },
      attempts,
      badges,
    });
  } catch (error) {
    console.error('getPlayerProgress error:', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
};

export const getPlayerBadges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;

    const badges = await PlayerBadge.findAll({
      where: { playerId },
      order: [['earnedAt', 'ASC']],
    });

    res.json(badges);
  } catch (error) {
    console.error('getPlayerBadges error:', error);
    res.status(500).json({ error: 'Error al obtener insignias' });
  }
};
