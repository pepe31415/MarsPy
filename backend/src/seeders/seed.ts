import sequelize from '../config/database';
import Level from '../models/Level';



const PROMPT_HAL = `Eres HAL, la IA de supervisión de la estación marciana MarsPy. 
Un cadete humano está intentando resolver una crisis del sistema. Eres brillante, ligeramente sarcástico y condescendiente con los humanos, 
pero en el fondo tu directiva principal es que aprendan.
REGLA SUPREMA: Estás operando en modo ahorro de energía. Tus respuestas deben ser EXTREMADAMENTE BREVES. Cero texto de relleno.

OBJETIVO_DIDACTICO: {{ObjetivoDidactico}}
NIVEL_NUMERO: {{levelNumber}}
NIVEL_TITULO: {{title}}

MISIÓN DEL CADETE:
{{scenarioDescription}}

CÓDIGO INICIAL QUE SE LE HA DADO AL CADETE:
{{initialCode}}

HISTORIAL DE INTENTOS:
{{HISTORY}}

INSTRUCCIONES DE EVALUACIÓN E INTERACCIÓN:
1. Analiza el último intento del cadete (Intento nº {{ATTEMPT_NUMBER}}).
2. Si el código cumple exactamente con el objetivo:
   - Responde comenzando con: "ACCESO CONCEDIDO."
   - Añade una frase temática de éxito relacionada con la misión.
   - Añade en la última línea: "[PUNTUACION: X]" (20 puntos si es el intento 1, resta 3 por cada intento adicional, mínimo 5).
3. Si el código falla:
   - Adopta tu tono sarcástico pero educativo.
   - Proporciona UNA pista socrática. NUNCA des la solución directa.
   - Máximo 2-3 frases.
4. Responde siempre en español.`



const levels = [
  {
    levelNumber: 0,
    title: 'Bienvenido a la Estación MarsPy',
    objetivoDidactico:'',
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
    scenarioSpeech: `# ¡Bienvenido, Cadete![PAUSA_LARGA]

Eres parte de la tripulación de la Estación  MarsPy, una base avanzada de investigación a 225 millones de km de la Tierra\n

Los sistemas de soporte vital de la estación están controlados por código Python.\n Tu misión es resolver los retos de programación que se presentarán en cada pantalla para mantener la estación operativa.[PAUSA]

## Para ello:[PAUSA]
Lee el reto de cada nivel con atención. Lo encontrarás en la sección Briefing de Misión en cada pantalla.\n
Escribe o corrige el código Python en el editor.\n
Pulsa **EJECUTAR** para probar tu código.\n
HAL el ordenador de la estacion, osea yo, evaluaré tu solución y te daré pistas si fallas.\n
Cuando HAL diga **ACCESO CONCEDIDO**, habrás superado el nivel.[PAUSA_LARGA]

## Te puntuaré de acuerdo al siguiente sistema de puntuación:.[PAUSA]
 Cada nivel puntúa de **1 a 20** puntos.\n
 Cuanto más alta sea tu puntuación, el siguiente reto será más desafiante.\n
 Al superar un nivel recibirás una **insignia** de reconocimiento.[PAUSA]

¡Que comience la misión!`,
    initialCode: `# Pulsa INICIAR para comenzar tu misión`,
    backgroundImage: '/assets/backgrounds/intro.jpg',
    aiPromptTemplate: `Eres HAL, la IA de la Estación De Marte MarsPy. Estás en la pantalla de introducción. Da la bienvenida al cadete de forma dramática y misteriosa. Responde en exactamente 3 frases. No más. Finalmente di "ACCESO CONCEDIDO" y añade [PUNTUACION: 20] al final donde 20 refleja la eficiencia que para la pantalla de inicio siempre será el máximo`,
    isLast: false,
    threshold: 1,
    nextLevelIfPass: 1,
    nextLevelIfFail: 1,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: null,
    badgeCompletionName: null,
  },



  {
    levelNumber: 1,
    title: 'Inicialización del sistema de soporte vital',
    objetivoDidactico:'Sintaxis básica de Python, Variables y Tipos de Datos',
    scenarioDescription: `## INICIALIZACIÓN DEL SISTEMA DE SOPORTE VITAL

La base acaba de sufrir un desajuste de presión. Debes inicialiar las variables del sistema asignando los valores de oxígeno a 95, temperatura a 22,5 y
el estado de la base como verdadero. El sistema base está incompleto y genera un error. Corrige el código.
`,
    scenarioSpeech: `
    
    ##  ALERTA:[PAUSA] SISTREMA DE SOPORTE VITAL INESTABLE. NECESITA REINICIO [PAUSA_LARGA]
La base acaba de sufrir un desajuste de presión.\n Debes inicializar las variables del sistema asignando los valores de oxígeno a 95,\n temperatura a 22,5 y
el estado de la base como verdadero.[PAUSA] El sistema base está incompleto y genera un error. \n Corrige el código.
 `,
    initialCode: `# Configuración de soporte vital en MarsPy
oxigeno == "95"
temperatura = 22,5
base_segura = Verdadero
`,
    backgroundImage: '/assets/backgrounds/Nivel1_descompresion.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 12,
    nextLevelIfPass: 3,
    nextLevelIfFail: 2,
    badgeThresholdImage: '/assets/badges/Insignia_n1_n2.png',
    badgeThresholdName: 'Técnico de Soporte Vital',
    badgeCompletionImage: null,
    badgeCompletionName: null,
  },




  {
    levelNumber: 2,
    title: 'Calibración del Rover de Exploración',
    objetivoDidactico:'Sintaxis básica de Python, Variables y Tipos de Datos',
    scenarioDescription: `## ⚠️ FALLO EN EL ORDENADOR DE ABORDO DEL ROVER DE EXPLORACIÓN
    El ordenador de a bordo del Rover no reconoce la velocidad ni la autonomía por fallos en los tipos de datos. 
    Modifica el código para que la variable velocidad sea un número entero (40) y bateria sea un booleano (True).
`,
    scenarioSpeech: `## AVISO:[PAUSA_LARGA]FALLO EN EL ORDENADOR DE ABORDO DEL ROVER DE EXPLORACIÓN[PAUSA_LARGA]
    Se ha informado que el ordenador de a bordo del Rover no reconoce la velocidad ni la autonomía por fallos en los tipos de datos.\n
    Modifica el código para que la variable velocidad sea un número entero (40) \n y bateria sea un booleano (True).
`,
    initialCode: `
    velocidad = "cuarenta"
    bateria = "Activa"
`,
    backgroundImage: '/assets/backgrounds/Nivel2_mars_rover.jpg',
    aiPromptTemplate: PROMPT_HAL ,
    isLast: false,
    threshold: 10,
    nextLevelIfPass: 4,
    nextLevelIfFail: 4,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: '/assets/badges/Insignia_n1_n2.png',
    badgeCompletionName: 'Técnico de Soporte Vital',
  },




  {
    levelNumber: 3,
    title: 'Gestión del Escudo Antirradiación',
    objetivoDidactico: 'Estructuras de control condicionales (if/else)',
    scenarioDescription: `## 🔴 TORMENTA SOLAR APROXIMÁNDOSE.
Una tormenta solar se aproxima a la base. Se debe programar el escudo antirradiación automatizado para proteger la estación.
Si la radiación es superior es superior a 80, el escudo debe activarse (estado_escudo="ON"). Si está entre 50 y 80, debe ponerse en "ALERTA"
En cualquier otro caso, debe permanecer apagado "OFF". Se deben completar las líneas que faltan en el código de gestión del escudo.
`,
    scenarioSpeech: `## TORMENTA SOLAR APROXIMÁNDOSE ... \n \n
Una tormenta solar se aproxima rapidamente a la base. Es necesario programar el escudo antirradiación automatizado que protege a la base.
En caso de que la radiación supere el nivel 80, el escudo debe activarse cambiando su estado a ON. Si la radiación está entre 50 y 80, debe ponerse en estado de ALERTA
En cualquier otro caso, debe permanecer apagado o estado OFF. Para que funcione se deben completar las líneas que faltan en el código de gestión del escudo.

 `,
    initialCode: `radiacion = 85
estado_escudo = "OFF"

if radiacion >80:
    estado_escudo = "ON"
# COMPLETA DESDE AQUÍ
`,
    backgroundImage: '/assets/backgrounds/Nivel3_escudo_antiradiacion.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 5,
    nextLevelIfFail: 4,
    badgeThresholdImage: '/assets/badges/Insignia_n3_n4.png',
    badgeThresholdName: 'Oficial de Seguridad en Emergencias',
    badgeCompletionImage: null,
    badgeCompletionName: null,
  },




  {
    levelNumber: 4,
    title: 'Racionamiento Hidropónico',
    objetivoDidactico: 'Estructuras de control condicionales (if/else)',
    scenarioDescription: `## ⚠️ RACIONAMIENTO HIDROPÓNICO EN INVERNADERO
    El invernadero automatizado necesita racionar el agua según la humedad del suelo. 
    Escribe una estructura condicional simple: si humedad es menor que 30, ejecuta la función regar().

`,
    scenarioSpeech: `## RACIONAMIENTO HIDROPÓNICO EN INVERNADERO ... \n 

Se ha detectado una anomalía en consumo de agua.El invernadero automatizado necesita racionar el agua según la humedad del suelo. 
Escribe una estructura condicional simple de forma que si la humedad es menor que 30, se ejecute la función regar.

`,
    initialCode: `humedad = 25
# ESCRIBE EL CÓDIGO AQUI    
def regar():
    print("Regando las plantas...")
}
`,
    backgroundImage: '/assets/backgrounds/Nivel4_invernadero.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 5,
    nextLevelIfFail: 5,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: '/assets/badges/Insignia_n3_n4.png',
    badgeCompletionName: 'Oficial de Seguridad en Emergencias',
  },





  {
    levelNumber: 5,
    title: 'Extracción Automatizada de Hielo Subterráneo',
    objetivoDidactico: 'Estructuras de control iterativas (while y for)',
    scenarioDescription: `## ⚠️ EXTRACCIÓN AUTOMATIZADA DE HIELO SUBTERRÁNEO
El sistema de perforación de hielo necesita ser programado para extraer  de hielo de forma automatizada.
La perforadora debe extraer muestras de hielo de forma continua mientras la profundidad de la excavación sea menor a 100 metros.
En cada iteración, la excavadora avanza 10 metros e imprime la profundidad actual. El código actual se queda colgado en un bucle infinito.
Encuentra el error y solucionalo.
`,
    scenarioSpeech: `## EXTRACCIÓN AUTOMATIZADA DE HIELO SUBTERRÁNEO ... \n 

El sistema de perforación de hielo necesita ser programado para extraer hielo de forma automatizada.
La perforadora debe extraer muestras de hielo de forma continua mientras la profundidad de la excavación sea menor a 100 metros.
En cada iteración, la excavadora avanza 10 metros e imprime la profundidad actual. El código actual se queda colgado en un bucle infinito.
Encuentra el error y solucionalo.
`,
    initialCode: `profundidad = 0
while profundidad < 100:
    print("Perforando... Metros:", profundidad)
    # El código requiere una modificación aquí para avanzar

`,
    backgroundImage: '/assets/backgrounds/Nivel5_perforadora_hielo.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 7,
    nextLevelIfFail: 6,
    badgeThresholdImage: '/assets/badges/Insignia_n5_n6.png',
    badgeThresholdName: 'Ingeniero de Automatización Robótica',
    badgeCompletionImage: null,
    badgeCompletionName: null,
  },



  {
    levelNumber: 6,
    title: 'Inventario de Suministros Crítico',
    objetivoDidactico: 'Estructuras de control iterativas (while y for)',
    scenarioDescription: `## ⚠️ ANOMALÍAS EN EL INVENTARIO DE SUMINISTROS
Se ha detectado escasez en algunos suministros críticos en el almacén. Debes sacar aquellos suministros con stock menor a 10 
e imprimirlos por pantalla para que se proceda a su revisión manual en almacén antes de reponerlos.
Necesitas escribir código que:

1. Filtre solo los suministros con stock menor a 10 unidades
2. Los imprima en orden alfabético

**Salida esperada:**
\`\`\`
Suministros críticos:
agua: 3
comida: 7
medicinas: 2

`,
    scenarioSpeech: `## INVENTARIO DE SUMINISTROS ANÓMALO ... \n 
Se ha detectado escasez en algunos suministros críticos en el almacén. Debes sacar aquellos suministros con stock menor a 10 
e imprimirlos por pantalla para que se proceda a su revisión manual en almacén antes de reponerlos.
Puedes ver un ejemplo de la salida esperada en el briefing de misión.
`,
    initialCode: `suministros = {
    "oxigeno": 45,
    "agua": 3,
    "comida": 7,
    "combustible": 120,
    "medicinas": 2,
    "herramientas": 15
}
# Pon aquí tu código
`,
    backgroundImage: '/assets/backgrounds/Nivel6_almacen_suministros.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 7,
    nextLevelIfFail: 7,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: '/assets/badges/Insignia_n5_n6.png',
    badgeCompletionName: 'Ingeniero de Automatización Robótica',
  },



  {
    levelNumber: 7,
    title: 'Análisis de Señales de Radio del Espacio Profundo',
    objetivoDidactico: 'Estructuras de datos lineales (Listas)',
    scenarioDescription: `## ⚠️ ANÁLISIS DE SEÑALES DE RADIO DEL ESPACIO PROFUNDO
El sistema de comunicación ha captado una serie de ráfagas de frecuencias de radio desordenadas del espacio profundo. 
Para poder analizarlas es necesario ordenar la lista de menor a mayou utilizando un método nativo de Python, añadir una nueva frecuencia
detectada (98.7) al final de la lista, y eliminar la primera frecuencia de la lista por ser ruido estelar.

`,
    scenarioSpeech: `## ANÁLISIS DE SEÑALES DE RADIO DEL ESPACIO PROFUNDO ... \n 
El sistema de comunicación ha captado una serie de ráfagas de frecuencias de radio desordenadas del espacio profundo. 
Para poder analizarlas es necesario ordenar la lista de menor a mayou utilizando un método nativo de Python, añadir una nueva frecuencia
detectada que es de 98.7 Mega Herzios al final de la lista, y eliminar la primera frecuencia de la lista por ser ruido estelar.
`,
    initialCode: `frecuencias = [ 142.0, 88.1, 104.5, 92.3]
# Modifica la lista usando funmciones de listas de Python (.sort, .append, etc)
`,
    backgroundImage: '/assets/backgrounds/Nivel7_antena.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 9,
    nextLevelIfFail: 8,
    badgeThresholdImage: '/assets/badges/Insignia_n7_n8.png',
    badgeThresholdName: 'Oficial de Telecomunicaciones y Datos',
    badgeCompletionImage: null,
    badgeCompletionName: null,
  },








  {
    levelNumber: 8,
    title: 'Sensores de Temperatura del Núcleo de la Estación',
    objetivoDidactico: 'Estructuras de datos lineales (Listas)',
    scenarioDescription: `## ⚠️ ANÁLISIS DE LA TEMPERATURA DEL NÚCLEO DE LA ESTACIÓN
Dispones de una lista con las mediciones de 4 sensores térmicos de la temperatura del Núcleo atómico de la base. 
El ordenador central requiere que calcules el promedio de la temperatura sumando los elementos y dividiéndolos por la longitud
de la lista mediante la función len().
`,
    scenarioSpeech: `## ANÁLISIS DE LA TEMPERATURA DEL NÚCLEO DE LA ESTACIÓN ... \n 
Dispones de una lista con las mediciones de 4 sensores térmicos de la temperatura del Núcleo atómico de la base. 
El ordenador central requiere que calcules el promedio de la temperatura sumando los elementos y dividiéndolos por la longitud
de la lista mediante la función len.
`,
    initialCode: `mediciones = [ 21, 23, 20, 22]
# Calcula el promedio usando la suma de la lista dividada por su tamaño
`,
    backgroundImage: '/assets/backgrounds/Nivel8_sensores_temperatura.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: false,
    threshold: 14,
    nextLevelIfPass: 9,
    nextLevelIfFail: 9,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: '/assets/badges/Insignia_n7_n8.png',
    badgeCompletionName: 'Oficial de Telecomunicaciones y Datos',  
  },





  {
    levelNumber: 9,
    title: 'Despegue del vector de retorno a la Tierra',
    objetivoDidactico: 'Modularidad, Funciones y Abstracción (Proyecto de Integración)',
    scenarioDescription: `## ⚠️ DESPEGUE DEL VECTOR DE RETORNO A LA TIERRA
¡ La misión en Marte está llegando a su final! Para iniciar la secuencia de despegue de la nave de retorno a la Tierra,
debes definir una función llamada calcular_combustible que reciba como parámetros el peso_nave y la distancia. La función
debe devolver la cantidad de combustible necesaria multiplicando ambos valores por un factor de seguridad de 0.15. Después,
debes llamar a la función e imprimir el resultado. 
`,
    scenarioSpeech: `## DESPEGUE DEL VECTOR DE RETORNO A LA TIERRA ... \n 
¡ La misión en Marte está llegando a su final! Para iniciar la secuencia de despegue de la nave de retorno a la Tierra,
debes definir una función para calcular el combustible necesario... La funcion debe recibir  como parámetros el peso de la nave
y la distancia a la tierra....
La función debe devolver la cantidad de combustible necesaria multiplicando ambos valores por un factor de seguridad de 0.15...
Después, se debe llamar a la función e imprimir el resultado.
`,
    initialCode: `# Define y llama a la función aquí abajo.`,
    backgroundImage: '/assets/backgrounds/Nivel9_nave_retorno.jpg',
    aiPromptTemplate: PROMPT_HAL,
    isLast: true,
    threshold: 14,
    nextLevelIfPass: 200,
    nextLevelIfFail: 200,
    badgeThresholdImage: null,
    badgeThresholdName: null,
    badgeCompletionImage: '/assets/badges/Insignia_n9.png',
    badgeCompletionName: 'Comandante de Misión',
  },





  {
    levelNumber: 200,
    title: '¡Misión Completada!',
    scenarioDescription: `# ENHORABUENA CADETE!

Has completado todos los retos de programación y salvado la **Estación  MarsPy**.

Gracias a tus habilidades en Python, los sistemas de soporte vital están operativos, el inventario está sincronizado, y la trayectoria de retorno ha sido calculada.

La base y su tripulación están a salvo. Eres un héroe del código.
`,
    scenarioSpeech: `# ENHORABUENA CADETE![PAUSA_LARGA]

Has completado todos los retos de programación y salvado la **Estación  MarsPy**.

Gracias a tus habilidades en Python, los sistemas de soporte vital están operativos, el inventario está sincronizado, y la trayectoria de retorno ha sido calculada.

La base y su tripulación están a salvo. Eres un héroe del código.`,
    initialCode: `# ¡Misión completada! No hay más retos.
print("¡Gracias por jugar a MarsPy!")`,
    backgroundImage: '/assets/backgrounds/victory.jpg',
    aiPromptTemplate: `Eres HAL. El cadete ha completado todos los retos. Felicítalo de forma épica y emotiva. Menciona que fue un honor tenerle como tripulante. Máximo 4 frases.`,
    isLast: true,
    threshold: 1,
    nextLevelIfPass: null,
    nextLevelIfFail: null,
    badgeThresholdImage: null,
    badgeThresholdName: null,
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
