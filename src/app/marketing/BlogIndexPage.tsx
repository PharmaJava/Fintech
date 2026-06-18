import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedPosts } from '@/content/blog';
import { getLocale, t } from '@/i18n';
import { formatDate } from '@/lib/format';
import { useSeo } from '@/lib/seo';

export function BlogIndexPage() {
  useSeo({
    title: 'Blog de Patrimonio — Finanzas personales, privacidad y FIRE',
    description:
      'Artículos sobre patrimonio neto, independencia financiera, privacidad y cómo sacar partido a tus finanzas con Patrimonio.',
    path: '/blog',
  });

  const posts = getLocalizedPosts(getLocale());

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t('blog.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('blog.subtitle')}</p>

      <div className="mt-8 space-y-4">
        {posts
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.date)} · {post.readingMinutes}{' '}
                    {t('blog.minutes')}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t('blog.readMore')} <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </section>
  );
}
