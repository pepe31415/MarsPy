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
    let newTotalScore = player.totalScore; // inicializa con el valor actual
    // puntuación base de la IA
    let scoreToAdd = score ?? 0
    if (passed && score !== null) {
 

      // Bonus por superar threshold en nivel principal
      // Si el alumno va por el camino difícil se le compensan
      // los puntos del nivel secundario que se salta
      const nivelesPrincipales = [1, 3, 5, 7]
      const superaThreshold = score >= level.threshold
      if (nivelesPrincipales.includes(levelNumber) && superaThreshold) {
        scoreToAdd = score + 20  // bonus equivalente al nivel secundario
      }
      // Calcula el nuevo total una sola vez aquí
      newTotalScore = player.totalScore + scoreToAdd;

      // Badge de superación simple — se otorga siempre al pasar el nivel
      if (level.badgeCompletionImage && level.badgeCompletionName) {
        const exists = await PlayerBadge.findOne({
          where: { playerId, levelNumber, badgeType: 'completion' }
        });
        if (!exists) {
          await PlayerBadge.create({
            playerId,
            levelNumber,
            badgeImage: level.badgeCompletionImage,
            badgeName: level.badgeCompletionName,
            badgeType: 'completion' as const,
            score: scoreToAdd,
            earnedAt: new Date(),
          });
        }
      }

      // Badge de threshold — solo si la puntuación alcanza el umbral
      if (level.badgeThresholdImage && level.badgeThresholdName && score >= level.threshold) {
        const exists = await PlayerBadge.findOne({
          where: { playerId, levelNumber, badgeType: 'threshold' }
        });
        if (!exists) {
          await PlayerBadge.create({
            playerId,
            levelNumber,
            badgeImage: level.badgeThresholdImage,
            badgeName: level.badgeThresholdName,
            badgeType: 'threshold' as const,
            score: scoreToAdd,
            earnedAt: new Date(),
          });
        }
      }

      // Determine next level
      if (level.isLast || levelNumber === 200) {
        // Game completed
        await player.update({
          currentLevelNumber: 200,
          totalScore: newTotalScore,
          completedAt: new Date(),
        });
        nextLevelNumber = 200;
      } else {
        // Check threshold to determine branching
        const goHigher = score >= level.threshold;
        nextLevelNumber = goHigher ? level.nextLevelIfPass : level.nextLevelIfFail;

        await player.update({
          currentLevelNumber: nextLevelNumber ?? levelNumber,
          totalScore: newTotalScore,
        });
      }
    }

    res.json({
      attempt,
      nextLevelNumber,
      passed,
      totalScore: newTotalScore,
      scoreWithBonus: scoreToAdd,
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

export const askHal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt requerido' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'API key no configurada en el servidor' });
      return;
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log('========== PROMPT A GEMINI ==========');
    console.log(prompt);
    console.log('=====================================');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('Gemini error:', data);
      res.status(response.status).json({ error: data.error?.message || 'Error de Gemini' });
      return;
    }

    const aiResponse = data.candidates[0].content.parts[0].text as string;

    console.log('========== RESPUESTA DE GEMINI ==========');
    console.log(JSON.stringify(aiResponse));
    console.log('=========================================');

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('askHal error:', error);
    res.status(500).json({ error: 'Error al consultar con HAL' });
  }
};
