import { Request, Response } from 'express';
import { Player, Level, GameAttempt, PlayerBadge } from '../models';

interface SubmitCodeBody {
  playerId: number;
  levelNumber: number;
  code: string;
  consoleOutput: string;
  timeElapsedSeconds: number;
  aiResponse: string;
  score: number | null;
  passed: boolean;
}

export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      playerId,
      levelNumber,
      code,
      consoleOutput,
      timeElapsedSeconds,
      aiResponse,
      score,
      passed,
    }: SubmitCodeBody = req.body;

    // Validate player
    const player = await Player.findByPk(playerId);
    if (!player) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }

    // Validate level
    const level = await Level.findOne({ where: { levelNumber } });
    if (!level) {
      res.status(404).json({ error: 'Nivel no encontrado' });
      return;
    }

    // Count previous attempts for this level by this player
    const previousAttempts = await GameAttempt.count({
      where: { playerId, levelNumber },
    });

    // Save the attempt
    const attempt = await GameAttempt.create({
      playerId,
      levelNumber,
      attemptNumber: previousAttempts + 1,
      codeSubmitted: code,
      aiResponse,
      score: score ?? null,
      passed,
      timeElapsedSeconds,
    });

    // Update player's last code
    await player.update({ lastCode: code });

    // If passed, handle level progression
    let nextLevelNumber: number | null = null;

    if (passed && score !== null) {
      // Award badge for this level (if not already earned)
      const existingBadge = await PlayerBadge.findOne({
        where: { playerId, levelNumber },
      });

      if (!existingBadge) {
        await PlayerBadge.create({
          playerId,
          levelNumber,
          badgeImage: level.badgeImage,
          badgeName: level.badgeName,
          score,
          earnedAt: new Date(),
        });
      }

      // Determine next level
      if (level.isLast || levelNumber === 200) {
        // Game completed
        await player.update({
          currentLevelNumber: 200,
          totalScore: player.totalScore + score,
          completedAt: new Date(),
        });
        nextLevelNumber = 200;
      } else {
        // Check threshold to determine branching
        const goHigher = score >= level.threshold;
        nextLevelNumber = goHigher ? level.nextLevelIfPass : level.nextLevelIfFail;

        await player.update({
          currentLevelNumber: nextLevelNumber ?? levelNumber,
          totalScore: player.totalScore + score,
        });
      }
    }

    res.json({
      attempt,
      nextLevelNumber,
      passed,
      totalScore: player.totalScore + (score ?? 0),
    });
  } catch (error) {
    console.error('submitCode error:', error);
    res.status(500).json({ error: 'Error al procesar envío' });
  }
};

export const getAttemptsForLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId, levelNumber } = req.params;

    const attempts = await GameAttempt.findAll({
      where: {
        playerId: parseInt(playerId),
        levelNumber: parseInt(levelNumber),
      },
      order: [['createdAt', 'ASC']],
    });

    res.json(attempts);
  } catch (error) {
    console.error('getAttemptsForLevel error:', error);
    res.status(500).json({ error: 'Error al obtener intentos' });
  }
};

export const buildHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId, levelNumber } = req.params;

    const attempts = await GameAttempt.findAll({
      where: {
        playerId: parseInt(playerId),
        levelNumber: parseInt(levelNumber),
      },
      order: [['attemptNumber', 'ASC']],
    });

    const history = attempts
      .map(
        (a) =>
          `[Intento ${a.attemptNumber}]\nCódigo:\n${a.codeSubmitted}\nResultado consola:\n(ver frontend)\nRespuesta HAL: ${a.aiResponse}\n`
      )
      .join('\n---\n');

    res.json({ history, attemptCount: attempts.length });
  } catch (error) {
    console.error('buildHistory error:', error);
    res.status(500).json({ error: 'Error al construir historial' });
  }
};
