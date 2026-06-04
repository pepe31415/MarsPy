import sequelize from '../config/database';
import Level from '../models/Level';

const levels = [
  {
    levelNumber: 0,
    title: 'Bienvenido a la Estación MarsPy',
    scenarioDescription: `# ¡Bienvenido, Cadete!

Eres parte de la tripulación de la **Estación De Marte MarsPy**, una base avanzada de investigación a 225 millones de km de la Tierra. 

Los sistemas de soporte vital de la estación están controlados por código Python. Tu misión es resolver los retos de programación que se presentarán en cada pantalla para mantener la estación operativa.

## Instrucciones
1. Lee el reto de cada nivel con atención. Lo encontrarás en la sección Briefing de Misión en cada pantalla.
2. Escribe o corrige el código Python en el editor
3. Pulsa **EJECUTAR** para probar tu código
4. La IA HAL evaluará tu solución y te dará pistas si fallas
5. Cuando HAL diga **ACCESO CONCEDIDO**, habrás superado el nivel

## Sistema de Puntuación
- Cada nivel puntúa de **1 a 20** puntos.
- Cuanto más alta sea tu puntuación, el siguiente reto será más desafiante
- Al superar un nivel recibirás una **insignia** de reconocimiento

¡Que comience la misión!`,
    initialCode: `# Pulsa INICIAR para comenzar tu misión`,
    backgroundImage: '/assets/backgrounds/intro.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Estás en la pantalla de introducción. Da la bienvenida al cadete de forma dramática y misteriosa. Responde en exactamente 3 frases. No más. Finalmente di "ACCESO CONCEDIDO" y añade [PUNTUACION: 20] al final donde 20 refleja la eficiencia que para la pantalla de inicio siempre será el máximo`,
    isLast: false,
    threshold: 1,
    nextLevelIfPass: 1,
    nextLevelIfFail: 1,
    badgeImage: '/badges/welcome.png',
    badgeName: 'Cadete Iniciado',
  },
  {
    levelNumber: 1,
    title: 'Reiniciar las Bombas de Oxígeno',
    scenarioDescription: `## 🔴 ALERTA: SOPORTE VITAL FALLANDO

Las bombas de oxígeno del módulo A necesitan ser reiniciadas secuencialmente. El protocolo requiere activar **exactamente 5 bombas**, numeradas del **1 al 5**, en orden.

Escribe un bucle \`for\` que imprima los números del 1 al 5, uno por línea.

**Ejemplo de salida esperada:**
\`\`\`
1
2
3
4
5
\`\`\``,
    initialCode: `print("Iniciando protocolo de reinicio...")
# Escribe tu bucle for aquí:

`,
    backgroundImage: '/assets/backgrounds/Nivel1_descompresion.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Un cadete está intentando arreglar las bombas de oxígeno.

MISIÓN DEL CADETE: escribir un bucle 'for' en Python que imprima los números del 1 al 5, uno por línea.

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES:
- Evalúa el último intento (número {{ATTEMPT_NUMBER}}).
- Si el código produce exactamente la salida "1\n2\n3\n4\n5", está correcto.
- Si es correcto: di "ACCESO CONCEDIDO. BOMBAS REINICIADAS." y añade [PUNTUACION: X] al final donde X refleja la eficiencia (20 si fue en el primer intento, menos si tuvo muchos errores).
- Si falla: sé sarcástico pero educativo, da una pista socrática SIN dar la solución. Máximo 2-3 frases.
- Responde siempre en español.`,
    isLast: false,
    threshold: 12,
    nextLevelIfPass: 3,
    nextLevelIfFail: 2,
    badgeImage: '/badges/oxygen.png',
    badgeName: 'Técnico de Oxígeno',
  },
  {
    levelNumber: 2,
    title: 'Calibración de Sensores (Modo Fácil)',
    scenarioDescription: `## ⚠️ SENSORES DE TEMPERATURA FUERA DE RANGO

Los sensores necesitan calibración. Hay un error en el siguiente código que impide calcular correctamente la temperatura media de la estación.

**Corrige el código** para que calcule e imprima la temperatura media de la lista.

**Salida esperada:**
\`\`\`
Temperatura media: 21.4
\`\`\``,
    initialCode: `temperaturas = [18, 22, 25, 19, 23]

# Hay un error en esta línea:
media = sum(temperaturas) / len(temperaturas)

print("Temperatura media:" media)
`,
    backgroundImage: '/assets/backgrounds/Nivel2_mars_rover.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Un cadete está corrigiendo el código de calibración de sensores.

MISIÓN DEL CADETE: Corregir el error de sintaxis en el código Python para que calcule e imprima correctamente "Temperatura media: 21.4".

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES:
- Evalúa el último intento (número {{ATTEMPT_NUMBER}}).
- Si la salida es exactamente "Temperatura media: 21.4", está correcto.
- Si es correcto: di "ACCESO CONCEDIDO. SENSORES CALIBRADOS." y añade [PUNTUACION: X].
- Si falla: guía al cadete con preguntas socráticas sobre sintaxis Python. ¿Falta algún separador entre argumentos del print?
- Máximo 3 frases. Responde en español.`,
    isLast: false,
    threshold: 10,
    nextLevelIfPass: 4,
    nextLevelIfFail: 4,
    badgeImage: '/badges/sensor.png',
    badgeName: 'Técnico de Sensores',
  },
  {
    levelNumber: 3,
    title: 'Protocolo de Emergencia - Funciones',
    scenarioDescription: `## 🚨 SISTEMA DE EMERGENCIA OFFLINE

El protocolo de emergencia requiere una función que determine si una sala debe ser evacuada. Una sala se evacua si la temperatura supera 30°C O si el nivel de CO2 supera 800ppm.

**Crea una función** \`debe_evacuar(temperatura, co2)\` que devuelva \`True\` si se debe evacuar y \`False\` en caso contrario.

**Ejemplo:**
\`\`\`python
print(debe_evacuar(35, 600))  # True (temperatura alta)
print(debe_evacuar(25, 900))  # True (CO2 alto)  
print(debe_evacuar(22, 400))  # False (todo normal)
\`\`\``,
    initialCode: `def debe_evacuar(temperatura, co2):
    # Escribe tu lógica aquí
    pass

# Pruebas:
print(debe_evacuar(35, 600))
print(debe_evacuar(25, 900))
print(debe_evacuar(22, 400))
`,
    backgroundImage: '/assets/backgrounds/Nivel3_escudo_antiradiacion.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Un cadete está programando el sistema de emergencia.

MISIÓN DEL CADETE: Crear una función Python 'debe_evacuar(temperatura, co2)' que devuelva True si temperatura > 30 O co2 > 800, y False en caso contrario.

La salida correcta debe ser:
True
True
False

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES:
- Evalúa el último intento (número {{ATTEMPT_NUMBER}}).
- Si la salida es exactamente "True\nTrue\nFalse", está correcto.
- Si es correcto: di "ACCESO CONCEDIDO. SISTEMA DE EMERGENCIA ACTIVADO." y añade [PUNTUACION: X].
- Si falla: guía con preguntas socráticas. ¿Qué operador lógico usarías para "esto O aquello"? No des la solución directa.
- Responde en español. Máximo 3 frases.`,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 5,
    nextLevelIfFail: 4,
    badgeImage: '/badges/emergency.png',
    badgeName: 'Oficial de Emergencias',
  },
  {
    levelNumber: 4,
    title: 'Inventario del Módulo de Suministros',
    scenarioDescription: `## 📦 INVENTARIO CRÍTICO DESORGANIZADO

El módulo de suministros tiene el inventario desordenado. Necesitas escribir código que:

1. Filtre solo los suministros con stock menor a 10 unidades
2. Los imprima en orden alfabético

**Salida esperada:**
\`\`\`
Suministros críticos:
agua: 3
comida: 7
medicinas: 2
\`\`\``,
    initialCode: `suministros = {
    "oxigeno": 45,
    "agua": 3,
    "comida": 7,
    "combustible": 120,
    "medicinas": 2,
    "herramientas": 15
}

# Filtra y muestra suministros con stock < 10 en orden alfabético
print("Suministros críticos:")
`,
    backgroundImage: '/assets/backgrounds/Nivel4_invernadero.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Un cadete está gestionando el inventario de emergencia.

MISIÓN DEL CADETE: Filtrar del diccionario 'suministros' los items con stock < 10 e imprimirlos en orden alfabético con formato "clave: valor".

La salida correcta debe ser exactamente:
Suministros críticos:
agua: 3
comida: 7
medicinas: 2

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES:
- Evalúa el último intento (número {{ATTEMPT_NUMBER}}).
- Si la salida coincide exactamente, está correcto.
- Si es correcto: di "ACCESO CONCEDIDO. INVENTARIO SINCRONIZADO." y añade [PUNTUACION: X].
- Si falla: guía con preguntas socráticas sobre diccionarios, bucles y sorted(). No des la solución.
- Responde en español. Máximo 3 frases.`,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 5,
    nextLevelIfFail: 4,
    badgeImage: '/badges/inventory.png',
    badgeName: 'Gestora de Inventario',
  },
  {
    levelNumber: 5,
    title: 'Algoritmo de Navegación - Reto Final',
    scenarioDescription: `## 🛸 SISTEMA DE NAVEGACIÓN CRÍTICO

La estación necesita calcular la trayectoria de retorno. Escribe una función \`fibonacci(n)\` que genere los primeros \`n\` números de Fibonacci y los devuelva en una lista.

El sistema de navegación usa la secuencia para calcular órbitas de retorno.

**Ejemplo:**
\`\`\`python
print(fibonacci(8))
# [0, 1, 1, 2, 3, 5, 8, 13]
\`\`\``,
    initialCode: `def fibonacci(n):
    # Genera los primeros n números de Fibonacci
    # Retorna una lista
    pass

print(fibonacci(8))
`,
    backgroundImage: '/assets/backgrounds/Nivel5_perforadora_hielo.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Un cadete está programando el algoritmo de navegación de retorno a Tierra.

MISIÓN DEL CADETE: Implementar una función Python 'fibonacci(n)' que devuelva una lista con los primeros n números de Fibonacci.

Para n=8 la salida correcta debe ser: [0, 1, 1, 2, 3, 5, 8, 13]

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES:
- Evalúa el último intento (número {{ATTEMPT_NUMBER}}).
- Si la salida para fibonacci(8) es [0, 1, 1, 2, 3, 5, 8, 13], está correcto.
- Si es correcto: di "ACCESO CONCEDIDO. TRAYECTORIA DE RETORNO CALCULADA. ¡MISIÓN CUMPLIDA, CADETE!" y añade [PUNTUACION: X].
- Si falla: guía con preguntas socráticas sobre cómo se calcula cada término Fibonacci a partir de los anteriores. No des la solución.
- Responde en español. Máximo 3 frases dramáticas.`,
    isLast: true,
    threshold: 1,
    nextLevelIfPass: 200,
    nextLevelIfFail: 200,
    badgeImage: '/badges/navigator.png',
    badgeName: 'Navegante Estelar',
  },
  {
    levelNumber: 200,
    title: '¡Misión Completada!',
    scenarioDescription: `# 🏆 ¡FELICITACIONES, CADETE!

Has completado todos los retos de programación y salvado la **Estación De Marte MarsPy**.

Gracias a tus habilidades en Python, los sistemas de soporte vital están operativos, el inventario está sincronizado, y la trayectoria de retorno ha sido calculada.

La Tierra está a salvo. Eres un héroe del código.

## Tu Historial de Misión
Aquí puedes ver todas las insignias que ganaste en tu misión.

*"La diferencia entre un buen programador y uno excelente es que el bueno sabe cómo hacer las cosas... y el excelente sabe cuántas veces no le salió a la primera."* — HAL`,
    initialCode: `# ¡Misión completada! No hay más retos.
print("¡Gracias por jugar MarsPy!")`,
    backgroundImage: '/assets/backgrounds/victory.jpg',
    aiPromptTemplate: `Eres HAL. El cadete ha completado todos los retos. Felicítalo de forma épica y emotiva. Menciona que fue un honor tenerle como tripulante. Máximo 4 frases.`,
    isLast: true,
    threshold: 1,
    nextLevelIfPass: null,
    nextLevelIfFail: null,
    badgeImage: '/badges/hero.png',
    badgeName: 'Héroe de la Estación',
  },
];

async function seed() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    console.log('🌱 Seeding levels...');

    for (const levelData of levels) {
      const [level, created] = await Level.findOrCreate({
        where: { levelNumber: levelData.levelNumber },
        defaults: levelData,
      });

      if (!created) {
        await level.update(levelData);
        console.log(`  ♻️  Updated level ${levelData.levelNumber}: ${levelData.title}`);
      } else {
        console.log(`  ✅ Created level ${levelData.levelNumber}: ${levelData.title}`);
      }
    }

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}


seed();
