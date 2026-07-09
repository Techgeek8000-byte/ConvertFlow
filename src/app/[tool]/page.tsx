import { Metadata } from 'next';
import { converterMetaMap } from '@/lib/converter-meta';
import { toolContent } from '@/lib/tool-content';
import ToolPageClient from './_client';

interface Props { params: Promise<{ tool: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const meta = converterMetaMap[tool];
  if (!meta) return { title: 'ConvertFlow — Convert Anything', description: '20+ free file, data, and image converters.' };
  return { title: meta.title, description: meta.description, keywords: meta.keywords, openGraph: { title: meta.title, description: meta.description, type: 'website' } };
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const meta = converterMetaMap[tool];
  const content = toolContent[tool] || {};
  return <ToolPageClient toolSlug={tool} toolMeta={meta ? { ...meta, ...content } : undefined} />;
}
