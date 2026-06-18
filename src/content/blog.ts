/**
 * content/blog — entradas del blog (contenido estatico, listo para crecer).
 *
 * Cada post es bilingüe (es/en). Añadir un post nuevo es agregar un objeto a
 * `BLOG_POSTS` con su contenido en ambos idiomas. Usa `getLocalizedPosts` /
 * `getLocalizedPost` para resolver contra el idioma activo.
 */
import type { Locale } from '@/i18n';

export interface BlogBlock {
  type: 'p' | 'h2';
  text: string;
}

interface LocalizedContent {
  title: string;
  description: string;
  body: BlogBlock[];
}

export interface BlogPost {
  slug: string;
  date: string; // YYYY-MM-DD
  readingMinutes: number;
  tags: string[];
  es: LocalizedContent;
  en: LocalizedContent;
}

/** Post resuelto a un idioma (forma plana lista para la UI). */
export interface LocalizedPost {
  slug: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  title: string;
  description: string;
  body: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'patrimonio-neto-vs-gastos',
    date: '2026-06-01',
    readingMinutes: 4,
    tags: ['patrimonio', 'finanzas personales'],
    es: {
      title: 'Patrimonio neto: la métrica que de verdad importa',
      description:
        'Por qué controlar tu patrimonio neto (activos menos pasivos) dice más de tu salud financiera que llevar la cuenta de cada café.',
      body: [
        {
          type: 'p',
          text: 'La mayoría de apps de finanzas se centran en los gastos del día a día. Está bien, pero es solo una parte de la foto. La métrica que de verdad refleja tu progreso es el patrimonio neto: todo lo que tienes (líquido, inversiones, inmuebles, vehículos) menos todo lo que debes.',
        },
        { type: 'h2', text: 'Por qué el histórico es clave' },
        {
          type: 'p',
          text: 'Un número aislado no dice nada; la tendencia lo dice todo. Por eso Patrimonio guarda valoraciones fechadas de cada activo y dibuja tu curva de riqueza a lo largo del tiempo. Ver la pendiente subir es el mejor incentivo para seguir.',
        },
        { type: 'h2', text: 'Privacidad primero' },
        {
          type: 'p',
          text: 'Tus cifras patrimoniales son de lo más sensible que existe. Por eso Patrimonio es local-first y cifrado: tus datos nunca salen de tu dispositivo. Sin nube, sin telemetría, sin terceros.',
        },
      ],
    },
    en: {
      title: 'Net worth: the metric that truly matters',
      description:
        'Why tracking your net worth (assets minus liabilities) tells you more about your financial health than counting every coffee.',
      body: [
        {
          type: 'p',
          text: 'Most finance apps focus on day-to-day spending. That is fine, but it is only part of the picture. The metric that really reflects your progress is net worth: everything you own (cash, investments, real estate, vehicles) minus everything you owe.',
        },
        { type: 'h2', text: 'Why history is key' },
        {
          type: 'p',
          text: 'A single number says nothing; the trend says everything. That is why Patrimonio stores dated valuations for each asset and draws your wealth curve over time. Watching the slope rise is the best incentive to keep going.',
        },
        { type: 'h2', text: 'Privacy first' },
        {
          type: 'p',
          text: 'Your net-worth figures are among the most sensitive data there is. That is why Patrimonio is local-first and encrypted: your data never leaves your device. No cloud, no telemetry, no third parties.',
        },
      ],
    },
  },
  {
    slug: 'que-es-fire',
    date: '2026-06-10',
    readingMinutes: 5,
    tags: ['FIRE', 'inversión'],
    es: {
      title: 'Qué es FIRE y cómo calcular tu número',
      description:
        'Independencia financiera explicada en cinco minutos: la regla del 4%, tu número FIRE y cómo simular escenarios con Monte Carlo.',
      body: [
        {
          type: 'p',
          text: 'FIRE (Financial Independence, Retire Early) es la idea de acumular suficiente capital para que las rentas de tus inversiones cubran tus gastos. A partir de ahí, trabajar es opcional.',
        },
        { type: 'h2', text: 'La regla del 4%' },
        {
          type: 'p',
          text: 'Una aproximación popular: necesitas unas 25 veces tus gastos anuales invertidas. Si gastas 20.000 € al año, tu número FIRE ronda los 500.000 €. Patrimonio calcula esto por ti y estima en cuántos años llegarías según tu aportación y rentabilidad.',
        },
        { type: 'h2', text: 'Por qué simular con Monte Carlo' },
        {
          type: 'p',
          text: 'Los mercados no crecen en línea recta. La simulación de Monte Carlo prueba miles de escenarios aleatorios y te da una probabilidad de éxito, no una falsa certeza. Patrimonio lo ejecuta en segundo plano para no bloquear la app.',
        },
      ],
    },
    en: {
      title: 'What FIRE is and how to compute your number',
      description:
        'Financial independence explained in five minutes: the 4% rule, your FIRE number and how to simulate scenarios with Monte Carlo.',
      body: [
        {
          type: 'p',
          text: 'FIRE (Financial Independence, Retire Early) is the idea of accumulating enough capital so that the income from your investments covers your expenses. From then on, working is optional.',
        },
        { type: 'h2', text: 'The 4% rule' },
        {
          type: 'p',
          text: 'A popular approximation: you need roughly 25 times your annual expenses invested. If you spend €20,000 a year, your FIRE number is around €500,000. Patrimonio computes this for you and estimates how many years it would take based on your contribution and return.',
        },
        { type: 'h2', text: 'Why simulate with Monte Carlo' },
        {
          type: 'p',
          text: 'Markets do not grow in a straight line. A Monte Carlo simulation tries thousands of random scenarios and gives you a probability of success, not a false certainty. Patrimonio runs it in the background so it never blocks the app.',
        },
      ],
    },
  },
];

/** Resuelve un post a su idioma activo (forma plana para la UI). */
export const localizePost = (post: BlogPost, locale: Locale): LocalizedPost => {
  const content = post[locale];
  return {
    slug: post.slug,
    date: post.date,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    title: content.title,
    description: content.description,
    body: content.body,
  };
};

/** Lista de posts resuelta al idioma activo. */
export const getLocalizedPosts = (locale: Locale): LocalizedPost[] =>
  BLOG_POSTS.map((post) => localizePost(post, locale));

/** Post por slug resuelto al idioma activo (o `undefined` si no existe). */
export const getLocalizedPost = (
  slug: string,
  locale: Locale,
): LocalizedPost | undefined => {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post ? localizePost(post, locale) : undefined;
};
