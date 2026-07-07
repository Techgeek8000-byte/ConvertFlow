import type { MetadataRoute } from 'next';

const baseUrl = 'https://convert-flow-beta.vercel.app';

const toolIds = [
  'json-to-csv', 'csv-to-json', 'xml-to-json', 'yaml-to-json', 'json-to-yaml', 'tsv-to-csv',
  'markdown-to-html', 'html-to-markdown', 'html-to-text', 'rtf-to-text',
  'image-converter', 'image-to-base64', 'base64-to-image', 'svg-to-png',
  'base64-encode', 'base64-decode', 'url-encode', 'url-decode', 'html-entity-encode', 'html-entity-decode', 'hash-generator',
  'json-formatter', 'case-converter', 'epoch-converter', 'regex-tester', 'jwt-decoder',
  'color-converter', 'color-palette-generator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  const toolPages = toolIds.map((id) => ({
    url: `${baseUrl}/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
