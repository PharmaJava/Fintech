/**
 * lib/seo — gestion ligera de metadatos por ruta para una SPA.
 *
 * Actualiza title, meta description, Open Graph, Twitter y canonical al navegar.
 * No es SSR, pero mejora compartir enlaces y la indexacion basica.
 */
import { useEffect } from 'react';

const SITE_URL = 'https://pharmajava.github.io/Fintech';
const SITE_NAME = 'Patrimonio';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const upsertMeta = (
  attr: 'name' | 'property',
  key: string,
  value: string,
): void => {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
};

const upsertCanonical = (href: string): void => {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

export interface SeoOptions {
  title: string;
  description: string;
  /** Ruta relativa (p.ej. "/blog"). */
  path?: string;
  type?: 'website' | 'article';
}

/** Aplica los metadatos SEO de la ruta actual. */
export const useSeo = ({
  title,
  description,
  path = '/',
  type = 'website',
}: SeoOptions): void => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', OG_IMAGE);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', OG_IMAGE);
    upsertCanonical(url);
  }, [title, description, path, type]);
};
