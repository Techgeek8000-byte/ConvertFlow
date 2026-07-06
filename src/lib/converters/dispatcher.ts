// ============================================================
// ConvertFlow — Conversion Dispatcher
// Routes tool IDs to the correct converter function
// ============================================================

import {
  csvToJson,
  jsonToCsv,
  xmlToJson,
  jsonToXml,
  yamlToJson,
  jsonToYaml,
  markdownToHtml,
  htmlToMarkdown,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  htmlEntitiesEncode,
  htmlEntitiesDecode,
  caseConvert,
  epochConvert,
  jsonFormat,
  colorConvert,
  hashGenerate,
  jwtDecode,
} from './text-converters';
import {
  imageConvert,
  imageToBase64,
  base64ToImage,
  svgToPng,
} from './image-converters';

// Helper: unwrap { data, error } or throw
function unwrap(result: { data: string; error?: string }): string {
  if (result.error) throw new Error(result.error);
  return result.data;
}

// ────────────── Text conversions ──────────────

export async function runConversion(
  toolId: string,
  input: string,
  options?: string
): Promise<string> {
  switch (toolId) {
    // Data
    case 'json-to-csv':
      return unwrap(jsonToCsv(input));
    case 'csv-to-json':
      return unwrap(csvToJson(input));
    case 'xml-to-json':
      return unwrap(xmlToJson(input));
    case 'yaml-to-json':
      return unwrap(yamlToJson(input));
    case 'json-to-yaml':
      return unwrap(jsonToYaml(input));
    case 'tsv-to-csv':
      return input
        .split('\n')
        .map((row) => row.split('\t').join(','))
        .join('\n');

    // Text
    case 'markdown-to-html':
      return markdownToHtml(input);
    case 'html-to-markdown':
      return htmlToMarkdown(input);
    case 'html-to-text':
      return input
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();

    // Encoding
    case 'base64-encode':
      return base64Encode(input);
    case 'base64-decode':
      return unwrap(base64Decode(input));
    case 'url-encode':
      return urlEncode(input);
    case 'url-decode':
      return urlDecode(input);
    case 'html-entity-encode':
      return htmlEntitiesEncode(input);
    case 'html-entity-decode':
      return htmlEntitiesDecode(input);

    // Special tools with options
    case 'hash-generator':
      return await hashGenerate(input, (options as 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512') || 'SHA-256');

    case 'case-converter':
      return caseConvert(input, (options as any) || 'uppercase');

    case 'epoch-converter':
      // options: 'toDate' | 'toTimestamp'
      // epochConvert handles both directions automatically
      return unwrap(epochConvert(input));

    case 'json-formatter':
      return unwrap(jsonFormat(input, (options as 'format' | 'minify' | 'validate') || 'format'));

    case 'color-converter':
      return unwrap(colorConvert(input, 'hex', (options as any) || 'rgb'));

    case 'jwt-decode':
      return unwrap(jwtDecode(input));

    default:
      throw new Error(`Unknown text converter: ${toolId}`);
  }
}

// ────────────── File conversions ──────────────

export async function runFileConversion(
  toolId: string,
  file: File,
  options?: string,
  quality?: number
): Promise<Blob | string> {
  switch (toolId) {
    case 'image-converter':
      return await imageConvert(file, options || 'png', quality);

    case 'image-to-base64':
      return await imageToBase64(file);

    case 'base64-to-image': {
      // This is text-to-file, handled differently, but just in case
      const text = await file.text();
      const result = base64ToImage(text);
      if (result.error) throw new Error(result.error);
      return result.blob;
    }

    case 'svg-to-png':
      return await svgToPng(file);

    case 'rtf-to-text': {
      // Basic RTF text extraction
      const rtfText = await file.text();
      const plain = rtfText
        .replace(/\\[a-z]+\d* ?/gi, '')
        .replace(/[{}]/g, '')
        .replace(/\\\\/g, '\\')
        .trim();
      return plain;
    }

    default:
      // Try to read as text and run text conversion
      const text = await file.text();
      return await runConversion(toolId, text, options);
  }
}