/**
 * content/blog — entradas del blog (contenido estatico, listo para crecer).
 *
 * Cada post tiene metadatos (para SEO) y un cuerpo como bloques simples. Añadir
 * nuevos posts es tan facil como agregar un objeto a `BLOG_POSTS`.
 */
export interface BlogBlock {
  type: 'p' | 'h2';
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  readingMinutes: number;
  tags: string[];
  body: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'patrimonio-neto-vs-gastos',
    title: 'Patrimonio neto: la métrica que de verdad importa',
    description:
      'Por qué controlar tu patrimonio neto (activos menos pasivos) dice más de tu salud financiera que llevar la cuenta de cada café.',
    date: '2026-06-01',
    readingMinutes: 4,
    tags: ['patrimonio', 'finanzas personales'],
    body: [
      {
        type: 'p',
        text: 'La mayoría de apps de finanzas se centran en los gastos del día a día. Está bien, pero es solo una parte de la foto. La métrica que de verdad refleja tu progreso es el patrimonio neto: todo lo que tienes (líquido, inversiones, inmuebles, vehículos) menos todo lo que debes.',
      },
      {
        type: 'h2',
        text: 'Por qué el histórico es clave',
      },
      {
        type: 'p',
        text: 'Un número aislado no dice nada; la tendencia lo dice todo. Por eso Patrimonio guarda valoraciones fechadas de cada activo y dibuja tu curva de riqueza a lo largo del tiempo. Ver la pendiente subir es el mejor incentivo para seguir.',
      },
      {
        type: 'h2',
        text: 'Privacidad primero',
      },
      {
        type: 'p',
        text: 'Tus cifras patrimoniales son de lo más sensible que existe. Por eso Patrimonio es local-first y cifrado: tus datos nunca salen de tu dispositivo. Sin nube, sin telemetría, sin terceros.',
      },
    ],
  },
  {
    slug: 'que-es-fire',
    title: 'Qué es FIRE y cómo calcular tu número',
    description:
      'Independencia financiera explicada en cinco minutos: la regla del 4%, tu número FIRE y cómo simular escenarios con Monte Carlo.',
    date: '2026-06-10',
    readingMinutes: 5,
    tags: ['FIRE', 'inversión'],
    body: [
      {
        type: 'p',
        text: 'FIRE (Financial Independence, Retire Early) es la idea de acumular suficiente capital para que las rentas de tus inversiones cubran tus gastos. A partir de ahí, trabajar es opcional.',
      },
      {
        type: 'h2',
        text: 'La regla del 4%',
      },
      {
        type: 'p',
        text: 'Una aproximación popular: necesitas unas 25 veces tus gastos anuales invertidas. Si gastas 20.000 € al año, tu número FIRE ronda los 500.000 €. Patrimonio calcula esto por ti y estima en cuántos años llegarías según tu aportación y rentabilidad.',
      },
      {
        type: 'h2',
        text: 'Por qué simular con Monte Carlo',
      },
      {
        type: 'p',
        text: 'Los mercados no crecen en línea recta. La simulación de Monte Carlo prueba miles de escenarios aleatorios y te da una probabilidad de éxito, no una falsa certeza. Patrimonio lo ejecuta en segundo plano para no bloquear la app.',
      },
    ],
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((post) => post.slug === slug);
