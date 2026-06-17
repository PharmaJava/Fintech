import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { getPostBySlug } from '@/content/blog';
import { formatDate } from '@/lib/format';
import { useSeo } from '@/lib/seo';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useSeo({
    title: post
      ? `${post.title} — Blog de Patrimonio`
      : 'Artículo no encontrado',
    description: post?.description ?? 'Artículo del blog de Patrimonio.',
    path: post ? `/blog/${post.slug}` : '/blog',
    type: 'article',
  });

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver al blog
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(post.date)} · {post.readingMinutes} min de lectura
      </p>

      <div className="mt-8 space-y-4 leading-relaxed">
        {post.body.map((block, index) =>
          block.type === 'h2' ? (
            <h2 key={index} className="pt-2 text-2xl font-semibold">
              {block.text}
            </h2>
          ) : (
            <p key={index} className="text-muted-foreground">
              {block.text}
            </p>
          ),
        )}
      </div>

      <div className="mt-10 rounded-lg border bg-primary/5 p-6 text-center">
        <p className="font-semibold">¿Listo para tomar el control?</p>
        <Link
          to="/app"
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Abrir Patrimonio
        </Link>
      </div>
    </article>
  );
}
