import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { BLOG_POSTS } from '@/content/blog';
import { formatDate } from '@/lib/format';
import { useSeo } from '@/lib/seo';

export function BlogIndexPage() {
  useSeo({
    title: 'Blog de Patrimonio — Finanzas personales, privacidad y FIRE',
    description:
      'Artículos sobre patrimonio neto, independencia financiera, privacidad y cómo sacar partido a tus finanzas con Patrimonio.',
    path: '/blog',
  });

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Ideas sobre patrimonio neto, independencia financiera y privacidad.
      </p>

      <div className="mt-8 space-y-4">
        {BLOG_POSTS.slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.date)} · {post.readingMinutes} min
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Leer más <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </section>
  );
}
