import { FC, PropsWithChildren } from 'react';
import Head from 'next/head';

export interface MetaProps {
  title: string;
  path: string;
  description?: string;
  siteName?: string;
  image?: {
    src: string;
    alt: string;
  };
  type?: string;
  updatedAt?: string;
  index?: boolean;
  follow?: boolean;
  locale?: string;
}

/**
 * Add meta tags to the document head.
 */
export const Meta: FC<PropsWithChildren<MetaProps>> = ({
  title,
  description,
  path,
  siteName = process.env.NEXT_PUBLIC_SITE_NAME,
  type = 'website',
  image,
  updatedAt,
  index = true,
  follow = true,
  locale = process.env.NEXT_PUBLIC_SITE_LOCALE,
  children,
}) => {
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_BASEURL || ''}${path}`;

  const indexString = index ? 'index' : 'noindex';
  const followString = follow ? 'follow' : 'nofollow';

  return (
    <Head>
      <title>{[title, siteName].filter(Boolean).join(' · ')}</title>
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={`${indexString} ${followString}`} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={locale} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image.src} />}
      {image && <meta property="og:image:alt" content={image.alt} />}
      {updatedAt && <meta property="og:updated" content={updatedAt} />}

      {children}
    </Head>
  );
};
