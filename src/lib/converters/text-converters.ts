// ============================================================
// ConvertFlow — Text Converters
// Pure functions: input=string, output=string (unless noted)
// ============================================================

// -------------------------------------------------------
// CSV ↔ JSON
// -------------------------------------------------------

export function csvToJson(csv: string): { data: string; error?: string } {
  try {
    const trimmed = csv.trim();
    if (!trimmed) return { data: '[]' };

    const rows: string[][] = [];
    let current = '';
    let inQuotes = false;
    let row: string[] = [];

    const pushCell = () => {
      row.push(current);
      current = '';
    };

    const pushRow = () => {
      rows.push(row);
      row = [];
    };

    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      const next = trimmed[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          current += '"';
          i++; // skip escaped quote
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          pushCell();
        } else if (ch === '\r' && next === '\n') {
          pushCell();
          pushRow();
          i++; // skip \n
        } else if (ch === '\n' || ch === '\r') {
          pushCell();
          pushRow();
        } else {
          current += ch;
        }
      }
    }
    // Flush last cell/row
    pushCell();
    if (row.length > 0 || current !== '') pushRow();

    if (rows.length < 2) {
      return { data: '[]' };
    }

    const headers = rows[0];
    const result = rows.slice(1).map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h.trim() || `col${idx}`] = r[idx] !== undefined ? r[idx].trim() : '';
      });
      return obj;
    });

    return { data: JSON.stringify(result, null, 2) };
  } catch (e) {
    return { data: '', error: `Failed to parse CSV: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// JSON → CSV
// -------------------------------------------------------

function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, string> = {},
): Record<string, string> {
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val === null || val === undefined) {
      result[fullKey] = '';
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val);
    } else if (typeof val === 'object') {
      flattenObject(val as Record<string, unknown>, fullKey, result);
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function jsonToCsv(json: string): { data: string; error?: string } {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { data: '', error: 'Input must be a non-empty JSON array' };
    }

    const flatRows = parsed.map((item) => flattenObject(item as Record<string, unknown>));
    const allKeys = new Set<string>();
    flatRows.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));
    const headers = Array.from(allKeys);

    const lines: string[] = [];
    lines.push(headers.map(csvEscape).join(','));

    for (const row of flatRows) {
      lines.push(headers.map((h) => csvEscape(row[h] ?? '')).join(','));
    }

    return { data: lines.join('\n') };
  } catch (e) {
    return { data: '', error: `Failed to convert JSON to CSV: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// JSON → XML
// -------------------------------------------------------

function jsonValueToXml(value: unknown, indent: string): string {
  if (value === null || value === undefined) return `${indent}<null/>`;
  if (Array.isArray(value)) {
    if (value.length === 0) return `${indent}<array/>`;
    return value.map((item) => `${indent}<item>\n${jsonValueToXml(item, indent + '  ')}\n${indent}</item>`).join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${indent}<object/>`;
    return entries.map(([k, v]) => {
      const tag = k.replace(/[^a-zA-Z0-9_.-]/g, '_');
      if (typeof v === 'object' && v !== null) {
        return `${indent}<${tag}>\n${jsonValueToXml(v, indent + '  ')}\n${indent}</${tag}>`;
      }
      const escaped = String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `${indent}<${tag}>${escaped}</${tag}>`;
    }).join('\n');
  }
  const escaped = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `${indent}${escaped}`;
}

export function jsonToXml(json: string): { data: string; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const body = jsonValueToXml(parsed, '  ');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${body}\n</root>`;
    return { data: xml };
  } catch (e) {
    return { data: '', error: `Failed to convert JSON to XML: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// XML → JSON
// -------------------------------------------------------

export function xmlToJson(xml: string): { data: string; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      return { data: '', error: 'Invalid XML: ' + errorNode.textContent };
    }

    const nodeToValue = (node: Element): unknown => {
      const childNodes = Array.from(node.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
      );

      // Collect attributes
      const attrs: Record<string, string> = {};
      for (const attr of Array.from(node.attributes)) {
        attrs[`@${attr.name}`] = attr.value;
      }

      // If no children elements and no meaningful text, just attributes
      if (childNodes.length === 0) {
        if (Object.keys(attrs).length > 0) return attrs;
        return null;
      }

      const elementChildren = childNodes.filter((n) => n.nodeType === Node.ELEMENT_NODE) as Element[];
      const textContent = childNodes
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim() || '')
        .join(' ')
        .trim();

      if (elementChildren.length === 0) {
        if (textContent !== '') {
          return Object.keys(attrs).length > 0 ? { ...attrs, '#text': textContent } : textContent;
        }
        return Object.keys(attrs).length > 0 ? attrs : null;
      }

      // Group child elements by tag name
      const grouped: Record<string, unknown[]> = {};
      for (const child of elementChildren) {
        const tag = child.tagName;
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(nodeToValue(child));
      }

      const result: Record<string, unknown> = {};
      if (Object.keys(attrs).length > 0) Object.assign(result, attrs);
      if (textContent) result['#text'] = textContent;

      for (const [tag, values] of Object.entries(grouped)) {
        result[tag] = values.length === 1 ? values[0] : values;
      }

      return result;
    }

    const root = doc.documentElement;
    const result: Record<string, unknown> = {};
    result[root.tagName] = nodeToValue(root);

    return { data: JSON.stringify(result, null, 2) };
  } catch (e) {
    return { data: '', error: `Failed to parse XML: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// JSON → YAML
// -------------------------------------------------------

function jsonToYamlValue(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes(':') || value.includes('#') || value.startsWith(' ') || value.includes('"') || value.includes("'")) {
      // Use literal block scalar for multi-line
      if (value.includes('\n')) {
        const lines = value.split('\n');
        return `|\n${lines.map((l) => pad + '  ' + l).join('\n')}`;
      }
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const inner = jsonToYamlObject(item as Record<string, unknown>, indent + 1);
        // Check if object is single line
        if (!inner.includes('\n')) return `${pad}- ${inner.trimStart()}`;
        return `${pad}-\n${inner}`;
      }
      if (Array.isArray(item)) {
        const inner = jsonToYamlValue(item, indent + 1);
        return `${pad}-\n${inner}`;
      }
      return `${pad}- ${jsonToYamlValue(item, 0)}`;
    });
    return items.join('\n');
  }

  if (typeof value === 'object') {
    return jsonToYamlObject(value as Record<string, unknown>, indent);
  }

  return String(value);
}

function jsonToYamlObject(obj: Record<string, unknown>, indent: number): string {
  const pad = '  '.repeat(indent);
  const entries = Object.entries(obj);

  if (entries.length === 0) return '{}';

  const lines = entries.map(([key, val]) => {
    const safeKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : `"${key}"`;
    if (val === null || val === undefined) {
      return `${pad}${safeKey}: null`;
    }
    if (typeof val === 'object' && !Array.isArray(val)) {
      const inner = jsonToYamlObject(val as Record<string, unknown>, indent + 1);
      if (!inner.includes('\n')) {
        // Try single-line object
        const entries2 = Object.entries(val as Record<string, unknown>);
        if (entries2.length <= 2) {
          const inline = entries2
            .map(([k, v]) => {
              const sk = /^[a-zA-Z0-9_-]+$/.test(k) ? k : `"${k}"`;
              return `${sk}: ${jsonToYamlValue(v, 0)}`;
            })
            .join(', ');
          return `${pad}${safeKey}: { ${inline} }`;
        }
      }
      return `${pad}${safeKey}:\n${inner}`;
    }
    if (Array.isArray(val)) {
      const inner = jsonToYamlValue(val, indent + 1);
      if (!inner.includes('\n') && val.length <= 3) {
        const items = val.map((v) => jsonToYamlValue(v, 0)).join(', ');
        return `${pad}${safeKey}: [${items}]`;
      }
      return `${pad}${safeKey}:\n${inner}`;
    }
    return `${pad}${safeKey}: ${jsonToYamlValue(val, 0)}`;
  });

  return lines.join('\n');
}

export function jsonToYaml(json: string): { data: string; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const yaml = jsonToYamlValue(parsed, 0);
    return { data: yaml };
  } catch (e) {
    return { data: '', error: `Failed to convert JSON to YAML: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// YAML → JSON  (simple hand-rolled parser)
// -------------------------------------------------------

export function yamlToJson(yaml: string): { data: string; error?: string } {
  try {
    // Normalize line endings
    const raw = yaml.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = raw.split('\n');
    const result = parseYamlBlock(lines, 0, 0);
    return { data: JSON.stringify(result.value, null, 2) };
  } catch (e) {
    return { data: '', error: `Failed to parse YAML: ${e instanceof Error ? e.message : String(e)}` };
  }
}

interface YamlParseResult {
  value: unknown;
  nextIndex: number;
}

function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function stripComment(line: string): string {
  // Don't strip inside quotes
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === '#' && !inSingle && !inDouble) {
      return line.slice(0, i).trimEnd();
    }
  }
  return line.trimEnd();
}

function unquoteString(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return s;
}

function parseYamlValue(valStr: string): unknown {
  const trimmed = valStr.trim();
  if (trimmed === '' || trimmed === '~' || trimmed === 'null') return null;
  if (trimmed === 'true' || trimmed === 'yes' || trimmed === 'on') return true;
  if (trimmed === 'false' || trimmed === 'no' || trimmed === 'off') return false;

  // Quoted string
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return unquoteString(trimmed);
  }

  // Number
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  if (/^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(trimmed)) return parseFloat(trimmed);

  // Inline array [a, b, c]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map((s) => parseYamlValue(s.trim()));
  }

  // Inline object { key: val, ... }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner === '') return {};
    const obj: Record<string, unknown> = {};
    const entries = splitInlineObject(inner);
    for (const entry of entries) {
      const colonIdx = entry.indexOf(':');
      if (colonIdx > -1) {
        const key = entry.slice(0, colonIdx).trim();
        const val = entry.slice(colonIdx + 1).trim();
        obj[unquoteString(key)] = parseYamlValue(val);
      }
    }
    return obj;
  }

  // Plain string
  return unquoteString(trimmed);
}

function splitInlineObject(s: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (const ch of s) {
    if (ch === "'" && !inDouble) { inSingle = !inSingle; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; }
    if (!inSingle && !inDouble) {
      if (ch === '[' || ch === '{') depth++;
      if (ch === ']' || ch === '}') depth--;
    }
    if (ch === ',' && depth === 0 && !inSingle && !inDouble) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function parseYamlBlock(lines: string[], startIndex: number, parentIndent: number): YamlParseResult {
  const obj: Record<string, unknown> = {};
  let i = startIndex;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = stripComment(rawLine);

    // Skip empty lines
    if (line === '') {
      i++;
      continue;
    }

    const indent = getIndent(rawLine);

    // If this line is at or below parent indent, we've exited this block
    if (indent <= parentIndent && line !== '') {
      // Unless this is the first line and matches parentIndent exactly (shouldn't happen in normal flow)
      break;
    }

    // List item
    if (line.startsWith('- ') || line === '-') {
      const listItems: unknown[] = [];
      while (i < lines.length) {
        const rawLine2 = lines[i];
        const line2 = stripComment(rawLine2);
        if (line2 === '') { i++; continue; }
        const indent2 = getIndent(rawLine2);
        if (indent2 < indent) break;
        if (!line2.startsWith('- ') && line2 !== '-') break;

        const afterDash = line2.startsWith('- ') ? line2.slice(2).trim() : '';

        if (afterDash === '') {
          // The value is on the next line(s) with greater indentation
          i++;
          // Collect the sub-block
          const subResult = parseYamlValueBlock(lines, i, indent + 2);
          listItems.push(subResult.value);
          i = subResult.nextIndex;
        } else if (afterDash.includes(':') && !afterDash.startsWith('"') && !afterDash.startsWith("'")) {
          // Could be a list of objects: - key: value
          const colonIdx = afterDash.indexOf(':');
          const possibleKey = afterDash.slice(0, colonIdx).trim();
          const possibleVal = afterDash.slice(colonIdx + 1).trim();

          // If the value is on the same line, it's a single key-value
          if (possibleVal !== '') {
            const subObj: Record<string, unknown> = {};
            subObj[unquoteString(possibleKey)] = parseYamlValue(possibleVal);
            // Check for more keys in this object at the same indent
            i++;
            while (i < lines.length) {
              const rawLine3 = lines[i];
              const line3 = stripComment(rawLine3);
              if (line3 === '') { i++; continue; }
              const indent3 = getIndent(rawLine3);
              if (indent3 <= indent) break;
              if (indent3 === indent + 2 && line3.includes(':') && !line3.startsWith('-')) {
                const cIdx = line3.indexOf(':');
                const k = line3.slice(0, cIdx).trim();
                const v = line3.slice(cIdx + 1).trim();
                if (v !== '') {
                  subObj[unquoteString(k)] = parseYamlValue(v);
                  i++;
                } else {
                  // Nested value
                  const subResult = parseYamlValueBlock(lines, i + 1, indent3);
                  subObj[unquoteString(k)] = subResult.value;
                  i = subResult.nextIndex;
                }
              } else {
                break;
              }
            }
            listItems.push(subObj);
          } else {
            // Value on next lines
            const subResult = parseYamlValueBlock(lines, i + 1, indent + 2);
            // Wrap in an object with this key
            const subObj: Record<string, unknown> = {};
            subObj[unquoteString(possibleKey)] = subResult.value;
            // Check for sibling keys
            let nextI = subResult.nextIndex;
            while (nextI < lines.length) {
              const rawLine4 = lines[nextI];
              const line4 = stripComment(rawLine4);
              if (line4 === '') { nextI++; continue; }
              const indent4 = getIndent(rawLine4);
              if (indent4 <= indent) break;
              if (indent4 === indent + 2 && line4.includes(':') && !line4.startsWith('-')) {
                const cIdx = line4.indexOf(':');
                const k = line4.slice(0, cIdx).trim();
                const v = line4.slice(cIdx + 1).trim();
                if (v !== '') {
                  subObj[unquoteString(k)] = parseYamlValue(v);
                  nextI++;
                } else {
                  const sr = parseYamlValueBlock(lines, nextI + 1, indent4);
                  subObj[unquoteString(k)] = sr.value;
                  nextI = sr.nextIndex;
                }
              } else {
                break;
              }
            }
            listItems.push(subObj);
            i = nextI;
          }
        } else {
          // Simple scalar list item
          listItems.push(parseYamlValue(afterDash));
          i++;
        }
      }

      // If the object is empty, just return the list
      if (Object.keys(obj).length === 0) {
        return { value: listItems, nextIndex: i };
      }
      // Otherwise assign to a key — but we don't have a key for a standalone list
      // This shouldn't normally happen in valid YAML at the root of a mapping
      return { value: listItems, nextIndex: i };
    }

    // Key-value pair
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const valStr = line.slice(colonIdx + 1).trim();

      if (valStr === '') {
        // Value is on subsequent indented lines
        i++;
        const subResult = parseYamlValueBlock(lines, i, indent + 2);
        obj[unquoteString(key)] = subResult.value;
        i = subResult.nextIndex;
      } else if (valStr === '|' || valStr === '|+' || valStr === '|-') {
        // Literal block scalar
        const stripLeading = valStr === '|-';
        const keepTrailing = valStr === '|+';
        i++;
        const blockLines: string[] = [];
        const blockIndent = getIndent(lines[i] || '') ;
        while (i < lines.length) {
          const bl = lines[i];
          if (bl.trim() === '' && i + 1 < lines.length && (lines[i + 1] as string).trim() === '') {
            if (keepTrailing) blockLines.push('');
            i++;
            continue;
          }
          if (bl.trim() === '') { blockLines.push(''); i++; continue; }
          const bi = getIndent(bl);
          if (bi < blockIndent) break;
          blockLines.push(bl.slice(blockIndent));
          i++;
        }
        let blockStr = blockLines.join('\n');
        if (stripLeading) blockStr = blockStr.replace(/\n+$/, '');
        if (!keepTrailing) blockStr = blockStr.replace(/\n+$/, '\n');
        obj[unquoteString(key)] = blockStr;
      } else if (valStr === '>' || valStr === '>+' || valStr === '>-') {
        // Folded block scalar
        i++;
        const blockLines: string[] = [];
        const blockIndent = getIndent(lines[i] || '');
        while (i < lines.length) {
          const bl = lines[i];
          if (bl.trim() === '') {
            blockLines.push('');
            i++;
            continue;
          }
          const bi = getIndent(bl);
          if (bi < blockIndent) break;
          blockLines.push(bl.slice(blockIndent));
          i++;
        }
        // Fold: replace single newlines with spaces, keep double newlines
        let folded = '';
        for (let li = 0; li < blockLines.length; li++) {
          if (blockLines[li] === '') {
            folded += '\n';
          } else if (li > 0 && blockLines[li - 1] !== '') {
            folded += ' ' + blockLines[li];
          } else {
            folded += blockLines[li];
          }
        }
        obj[unquoteString(key)] = folded.trimEnd();
      } else {
        obj[unquoteString(key)] = parseYamlValue(valStr);
        i++;
      }
    } else {
      // Standalone value at this indent level (shouldn't normally happen in a mapping)
      i++;
    }
  }

  return { value: obj, nextIndex: i };
}

function parseYamlValueBlock(lines: string[], startIndex: number, expectedIndent: number): YamlParseResult {
  if (startIndex >= lines.length) {
    return { value: null, nextIndex: startIndex };
  }

  // Skip blank lines to find the actual content
  let firstContent = startIndex;
  while (firstContent < lines.length && stripComment(lines[firstContent]).trim() === '') {
    firstContent++;
  }

  if (firstContent >= lines.length) {
    return { value: null, nextIndex: startIndex };
  }

  const firstLine = stripComment(lines[firstContent]);
  const firstIndent = getIndent(lines[firstContent]);

  if (firstIndent < expectedIndent) {
    return { value: null, nextIndex: firstContent };
  }

  // Check if it's a list
  if (firstLine.startsWith('- ') || firstLine === '-') {
    return parseYamlListBlock(lines, firstContent, expectedIndent);
  }

  // It's a mapping
  return parseYamlBlock(lines, firstContent, expectedIndent - 2);
}

function parseYamlListBlock(lines: string[], startIndex: number, listIndent: number): YamlParseResult {
  const items: unknown[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = stripComment(rawLine);
    if (line === '') { i++; continue; }

    const indent = getIndent(rawLine);
    if (indent < listIndent) break;
    if (indent > listIndent) { i++; continue; }

    if (!line.startsWith('- ') && line !== '-') break;

    const afterDash = line.startsWith('- ') ? line.slice(2).trim() : '';

    if (afterDash === '') {
      i++;
      const subResult = parseYamlValueBlock(lines, i, listIndent + 2);
      items.push(subResult.value);
      i = subResult.nextIndex;
    } else if (afterDash.includes(':') && !afterDash.startsWith('"') && !afterDash.startsWith("'")) {
      // List item that is an object: - key: value or - key:
      const colonIdx = afterDash.indexOf(':');
      const possibleKey = afterDash.slice(0, colonIdx).trim();
      const possibleVal = afterDash.slice(colonIdx + 1).trim();

      const subObj: Record<string, unknown> = {};

      if (possibleVal !== '') {
        subObj[unquoteString(possibleKey)] = parseYamlValue(possibleVal);
        i++;
        // Continue parsing more keys at indent + 2
        while (i < lines.length) {
          const rl = lines[i];
          const ln = stripComment(rl);
          if (ln === '') { i++; continue; }
          const ind = getIndent(rl);
          if (ind < listIndent + 2) break;
          if (ind > listIndent + 2) { i++; continue; }
          if (ln.startsWith('-')) break;
          const ci = ln.indexOf(':');
          if (ci < 1) { i++; continue; }
          const k = ln.slice(0, ci).trim();
          const v = ln.slice(ci + 1).trim();
          if (v !== '') {
            subObj[unquoteString(k)] = parseYamlValue(v);
            i++;
          } else {
            const sr = parseYamlValueBlock(lines, i + 1, ind + 2);
            subObj[unquoteString(k)] = sr.value;
            i = sr.nextIndex;
          }
        }
      } else {
        i++;
        // Value is on next lines
        // Find the content indent
        let nextContent = i;
        while (nextContent < lines.length && stripComment(lines[nextContent]).trim() === '') nextContent++;
        if (nextContent < lines.length) {
          const ncIndent = getIndent(lines[nextContent]);
          const sr = parseYamlValueBlock(lines, i, ncIndent);
          subObj[unquoteString(possibleKey)] = sr.value;
          i = sr.nextIndex;
          // Check for sibling keys at the same indent as the first sub-key
          while (i < lines.length) {
            const rl = lines[i];
            const ln = stripComment(rl);
            if (ln === '') { i++; continue; }
            const ind = getIndent(rl);
            if (ind < ncIndent) break;
            if (ind > ncIndent) { i++; continue; }
            if (ln.startsWith('-')) break;
            const ci = ln.indexOf(':');
            if (ci < 1) { i++; continue; }
            const k = ln.slice(0, ci).trim();
            const v = ln.slice(ci + 1).trim();
            if (v !== '') {
              subObj[unquoteString(k)] = parseYamlValue(v);
              i++;
            } else {
              const sr2 = parseYamlValueBlock(lines, i + 1, ind + 2);
              subObj[unquoteString(k)] = sr2.value;
              i = sr2.nextIndex;
            }
          }
        }
      }
      items.push(subObj);
    } else {
      // Simple scalar
      items.push(parseYamlValue(afterDash));
      i++;
    }
  }

  return { value: items, nextIndex: i };
}

// -------------------------------------------------------
// Markdown → HTML
// -------------------------------------------------------

export function markdownToHtml(md: string): string {
  // Process code blocks first (protect from other transformations)
  const codeBlocks: string[] = [];
  let processed = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const index = codeBlocks.length;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`);
    return `%%CODEBLOCK_${index}%%`;
  });

  // Process tables before other inline processing
  processed = processed.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, headerRow, _sepRow, bodyRows) => {
    const headers = headerRow.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim());
    const rows = bodyRows.trim().split('\n').map((row: string) =>
      row.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim()),
    );

    let table = '<table>\n<thead>\n<tr>\n';
    for (const h of headers) {
      table += `<th>${inlineMarkdown(h)}</th>\n`;
    }
    table += '</tr>\n</thead>\n<tbody>\n';
    for (const row of rows) {
      table += '<tr>\n';
      for (const cell of row) {
        table += `<td>${inlineMarkdown(cell)}</td>\n`;
      }
      table += '</tr>\n';
    }
    table += '</tbody>\n</table>';
    return table;
  });

  // Split into lines for block-level processing
  const lines = processed.split('\n');
  const htmlLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inBlockquote = false;

  function closeList() {
    if (inList) {
      htmlLines.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip code block placeholders (already processed)
    if (line.startsWith('%%CODEBLOCK_')) {
      closeList();
      closeBlockquote();
      const idx = parseInt(line.match(/%%CODEBLOCK_(\d+)%%/)?.[1] || '0', 10);
      htmlLines.push(codeBlocks[idx] || '');
      continue;
    }

    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      closeList();
      closeBlockquote();
      htmlLines.push('');
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*|___)\s*$/.test(trimmed)) {
      closeList();
      closeBlockquote();
      htmlLines.push('<hr />');
      continue;
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      closeList();
      closeBlockquote();
      const level = headerMatch[1].length;
      const content = inlineMarkdown(headerMatch[2].trim());
      htmlLines.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      closeList();
      const content = inlineMarkdown(trimmed.replace(/^>\s?/, ''));
      if (!inBlockquote) {
        htmlLines.push('<blockquote>');
        inBlockquote = true;
      }
      htmlLines.push(`<p>${content}</p>`);
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        htmlLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlLines.push(`<li>${inlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        htmlLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlLines.push(`<li>${inlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    closeList();
    closeBlockquote();
    htmlLines.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  closeList();
  closeBlockquote();

  return htmlLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function inlineMarkdown(text: string): string {
  let result = text;

  // Inline code (before other inline to protect content)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images (before links because ![...](...) is subset of [...](...))
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold + italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Line breaks (two spaces at end of line → <br>)
  // (handled per-line already, but for completeness within inline)
  result = result.replace(/  \n/g, '<br />\n');

  return result;
}

// -------------------------------------------------------
// HTML → Markdown
// -------------------------------------------------------

export function htmlToMarkdown(html: string): string {
  // Process block elements
  let md = html;

  // Code blocks (pre > code)
  md = md.replace(/<pre[^>]*><code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, lang, code) => {
      const decoded = decodeHtmlEntities(code);
      return `\n\`\`\`${lang}\n${decoded.trim()}\n\`\`\`\n`;
    });
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, code) => {
      const decoded = decodeHtmlEntities(code);
      return `\n\`\`\`\n${decoded.trim()}\n\`\`\`\n`;
    });
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_m, code) => {
      const decoded = decodeHtmlEntities(code);
      return `\n\`\`\`\n${decoded.trim()}\n\`\`\`\n`;
    });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_match, tableContent) => {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<t[h|d][^>]*>([\s\S]*?)<\/t[h|d]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(stripHtmlTags(cellMatch[1]).trim());
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return '';

    const maxCols = Math.max(...rows.map((r) => r.length));
    const normalizedRows = rows.map((r) => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const header = normalizedRows[0];
    const sep = header.map(() => '---').join(' | ');
    const bodyRows = normalizedRows.slice(1).map((r) => r.join(' | '));

    return '\n' + header.join(' | ') + '\n' + sep + '\n' + bodyRows.join('\n') + '\n';
  });

  // Headers
  for (let level = 6; level >= 1; level--) {
    const regex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, 'gi');
    md = md.replace(regex, (_m, content) => {
      return `\n${'#'.repeat(level)} ${stripHtmlTags(content).trim()}\n`;
    });
  }

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, content) => {
    const inner = stripHtmlTags(content)
      .trim()
      .split('\n')
      .map((l: string) => `> ${l}`)
      .join('\n');
    return `\n${inner}\n`;
  });

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Paragraph
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, content) => {
    return `\n${stripHtmlTags(content).trim()}\n`;
  });

  // Bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  // Italic
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Strikethrough
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Unordered list
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, content) => {
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    return '\n' + stripHtmlTags(items).trim() + '\n';
  });

  // Ordered list
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, content) => {
    let idx = 1;
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m2: string, item: string) => {
      return `${idx++}. ${item}\n`;
    });
    return '\n' + stripHtmlTags(items).trim() + '\n';
  });

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Clean up remaining tags
  md = stripHtmlTags(md);

  // Decode HTML entities
  md = decodeHtmlEntities(md);

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function decodeHtmlEntities(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  let result = html;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  // Numeric entities
  result = result.replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => String.fromCharCode(parseInt(code, 16)));
  return result;
}

// -------------------------------------------------------
// Base64 Encode / Decode
// -------------------------------------------------------

export function base64Encode(text: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf-8').toString('base64');
  }
  // Fallback for browser
  return btoa(unescape(encodeURIComponent(text)));
}

export function base64Decode(b64: string): { data: string; error?: string } {
  try {
    if (typeof Buffer !== 'undefined') {
      return { data: Buffer.from(b64, 'base64').toString('utf-8') };
    }
    return { data: decodeURIComponent(escape(atob(b64))) };
  } catch (e) {
    return { data: '', error: `Invalid Base64: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// -------------------------------------------------------
// URL Encode / Decode
// -------------------------------------------------------

export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  return decodeURIComponent(text);
}

// -------------------------------------------------------
// HTML Entities Encode / Decode
// -------------------------------------------------------

export function htmlEntitiesEncode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function htmlEntitiesDecode(text: string): string {
  return decodeHtmlEntities(text);
}

// -------------------------------------------------------
// Case Converter
// -------------------------------------------------------

export type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'kebab-case'
  | 'CONSTANT_CASE'
  | 'dot.case'
  | 'no spaces'
  | 'alt case';

function splitIntoWords(text: string): string[] {
  // Split on whitespace, underscores, hyphens, dots, and camelCase boundaries
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-.]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function caseConvert(text: string, caseType: CaseType): string {
  const words = splitIntoWords(text);
  if (words.length === 0) return '';

  switch (caseType) {
    case 'upper':
      return text.toUpperCase();

    case 'lower':
      return text.toLowerCase();

    case 'title':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    case 'sentence': {
      const lowered = words.map((w) => w.toLowerCase());
      return lowered[0].charAt(0).toUpperCase() + lowered[0].slice(1) + lowered.slice(1).join(' ');
    }

    case 'camelCase':
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');

    case 'PascalCase':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');

    case 'snake_case':
      return words.map((w) => w.toLowerCase()).join('_');

    case 'kebab-case':
      return words.map((w) => w.toLowerCase()).join('-');

    case 'CONSTANT_CASE':
      return words.map((w) => w.toUpperCase()).join('_');

    case 'dot.case':
      return words.map((w) => w.toLowerCase()).join('.');

    case 'no spaces':
      return words.join('');

    case 'alt case': {
      let upper = false;
      return text
        .split('')
        .map((ch) => {
          if (/[a-zA-Z]/.test(ch)) {
            const result = upper ? ch.toUpperCase() : ch.toLowerCase();
            upper = !upper;
            return result;
          }
          return ch;
        })
        .join('');
    }

    default:
      return text;
  }
}

// -------------------------------------------------------
// Epoch / Unix Timestamp Converter
// -------------------------------------------------------

export function epochConvert(input: string): { data: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { data: '', error: 'Empty input' };

  // Check if it's a number (unix timestamp)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    let ms: number;

    if (Math.abs(num) > 1e12) {
      // Already in milliseconds
      ms = num;
    } else {
      // Seconds
      ms = num * 1000;
    }

    const date = new Date(ms);

    if (isNaN(date.getTime())) {
      return { data: '', error: 'Invalid timestamp' };
    }

    const formats = [
      `ISO 8601:      ${date.toISOString()}`,
      `UTC:           ${date.toUTCString()}`,
      `Local:         ${date.toLocaleString()}`,
      `Date:          ${date.toLocaleDateString()}`,
      `Time:          ${date.toLocaleTimeString()}`,
      `Unix (s):      ${Math.floor(ms / 1000)}`,
      `Unix (ms):     ${ms}`,
    ];

    return { data: formats.join('\n') };
  }

  // Check for relative time patterns like "2 hours ago", "in 3 days"
  const relativeMatch = trimmed.match(
    /^(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*(ago|from now|in the future)?$/i,
  );
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    const direction = relativeMatch[3]?.toLowerCase();

    const multipliers: Record<string, number> = {
      second: 1000,
      minute: 60 * 1000,
      hour: 3600 * 1000,
      day: 86400 * 1000,
      week: 7 * 86400 * 1000,
      month: 30 * 86400 * 1000,
      year: 365 * 86400 * 1000,
    };

    const ms = amount * (multipliers[unit] || 0);
    const now = Date.now();
    const isPast = !direction || direction === 'ago';

    const targetDate = new Date(isPast ? now - ms : now + ms);

    const formats = [
      `${isPast ? amount + ' ' + unit + '(s) ago →' : 'In ' + amount + ' ' + unit + '(s) →'}`,
      `ISO 8601:      ${targetDate.toISOString()}`,
      `UTC:           ${targetDate.toUTCString()}`,
      `Local:         ${targetDate.toLocaleString()}`,
      `Unix (s):      ${Math.floor(targetDate.getTime() / 1000)}`,
      `Unix (ms):     ${targetDate.getTime()}`,
    ];

    return { data: formats.join('\n') };
  }

  // Try parsing as a human date
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return { data: '', error: 'Could not parse date. Try formats like: 2024-01-15, Jan 15 2024, 1705276800' };
  }

  const formats = [
    `Parsed:        ${trimmed}`,
    `ISO 8601:      ${date.toISOString()}`,
    `UTC:           ${date.toUTCString()}`,
    `Local:         ${date.toLocaleString()}`,
    `Unix (s):      ${Math.floor(date.getTime() / 1000)}`,
    `Unix (ms):     ${date.getTime()}`,
  ];

  return { data: formats.join('\n') };
}

// -------------------------------------------------------
// JSON Format / Minify / Validate
// -------------------------------------------------------

export function jsonFormat(json: string, action: 'format' | 'minify' | 'validate'): { data: string; error?: string } {
  try {
    const parsed = JSON.parse(json);

    switch (action) {
      case 'format':
        return { data: JSON.stringify(parsed, null, 2) };
      case 'minify':
        return { data: JSON.stringify(parsed) };
      case 'validate':
        return { data: 'Valid JSON ✓\n\n' + JSON.stringify(parsed, null, 2) };
      default:
        return { data: '', error: 'Invalid action. Use "format", "minify", or "validate".' };
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    if (action === 'validate') {
      return { data: '', error: `Invalid JSON: ${errorMsg}` };
    }
    return { data: '', error: `Invalid JSON: ${errorMsg}` };
  }
}

// -------------------------------------------------------
// Color Converter
// -------------------------------------------------------

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'cmyk';

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }
interface CMYK { c: number; m: number; y: number; k: number; }

function parseHex(hex: string): RGB {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (h.length === 8) {
    // With alpha, ignore alpha
    h = h.slice(0, 6);
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function parseRgb(str: string): RGB {
  const match = str.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/,
  );
  if (!match) throw new Error(`Invalid RGB color: ${str}`);
  return {
    r: Math.min(255, parseInt(match[1], 10)),
    g: Math.min(255, parseInt(match[2], 10)),
    b: Math.min(255, parseInt(match[3], 10)),
  };
}

function parseHsl(str: string): RGB {
  const match = str.match(/hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?/);
  if (!match) throw new Error(`Invalid HSL color: ${str}`);

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function parseCmyk(str: string): RGB {
  const match = str.match(/cmyk\s*\(\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/i);
  if (!match) throw new Error(`Invalid CMYK color: ${str}`);

  const c = parseFloat(match[1]) / 100;
  const m = parseFloat(match[2]) / 100;
  const y = parseFloat(match[3]) / 100;
  const k = parseFloat(match[4]) / 100;

  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToCmyk(rgb: RGB): CMYK {
  if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export function colorConvert(input: string, fromFormat: ColorFormat, toFormat: ColorFormat): { data: string; error?: string } {
  try {
    const trimmed = input.trim();

    // Parse to RGB
    let rgb: RGB;
    switch (fromFormat) {
      case 'hex': rgb = parseHex(trimmed); break;
      case 'rgb': rgb = parseRgb(trimmed); break;
      case 'hsl': rgb = parseHsl(trimmed); break;
      case 'cmyk': rgb = parseCmyk(trimmed); break;
      default:
        return { data: '', error: `Unknown source format: ${fromFormat}` };
    }

    // Convert from RGB to target format
    switch (toFormat) {
      case 'hex':
        return { data: rgbToHex(rgb) };
      case 'rgb':
        return { data: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` };
      case 'hsl': {
        const hsl = rgbToHsl(rgb);
        return { data: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` };
      }
      case 'cmyk': {
        const cmyk = rgbToCmyk(rgb);
        return { data: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` };
      }
      default:
        return { data: '', error: `Unknown target format: ${toFormat}` };
    }
  } catch (e) {
    return { data: '', error: e instanceof Error ? e.message : String(e) };
  }
}

// -------------------------------------------------------
// Hash Generator
// -------------------------------------------------------

// MD5 implementation (pure JS, no external lib)
function md5(input: string): string {
  // Pre-processing: adding padding bits
  const msgLen = input.length * 8;
  const msg = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    msg[i] = input.charCodeAt(i);
  }

  // Append bit '1' to message (0x80 byte)
  const bitLen = msgLen;
  let paddedLen = msg.length + 1;
  while (paddedLen % 64 !== 56) paddedLen++;
  const padded = new Uint8Array(paddedLen + 8);
  padded.set(msg);
  padded[msg.length] = 0x80;

  // Append original length in bits as 64-bit little-endian
  const view = new DataView(padded.buffer);
  // Low 32 bits
  view.setUint32(paddedLen, bitLen >>> 0, true);
  // High 32 bits (for lengths > 2^32, but we use 0 for typical strings)
  view.setUint32(paddedLen + 4, Math.floor(bitLen / 0x100000000) >>> 0, true);

  // Initialize hash values
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // Per-round shift amounts
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Pre-computed K table
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  const M = new Uint32Array(16);

  // Process each 512-bit (64-byte) chunk
  for (let offset = 0; offset < padded.length; offset += 64) {
    // Break chunk into sixteen 32-bit words M[j], little-endian
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Produce the final hash value (little-endian)
  const hash = new Uint8Array(16);
  const resultView = new DataView(hash.buffer);
  resultView.setUint32(0, a0, true);
  resultView.setUint32(4, b0, true);
  resultView.setUint32(8, c0, true);
  resultView.setUint32(12, d0, true);

  // Convert to hex
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashGenerate(text: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  if (algorithm === 'MD5') {
    return md5(text);
  }

  // Use Web Crypto API for SHA algorithms
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  let algoName: string;
  switch (algorithm) {
    case 'SHA-1': algoName = 'SHA-1'; break;
    case 'SHA-256': algoName = 'SHA-256'; break;
    case 'SHA-512': algoName = 'SHA-512'; break;
    default: algoName = 'SHA-256';
  }

  const hashBuffer = await crypto.subtle.digest(algoName, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// -------------------------------------------------------
// JWT Decoder
// -------------------------------------------------------

export function jwtDecode(token: string): { data: string; error?: string } {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { data: '', error: 'Invalid JWT: must have 3 parts separated by dots (header.payload.signature)' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    const base64UrlDecode = (str: string): string => {
      // Replace URL-safe characters
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with '='
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      return atob(base64);
    };

    const headerJson = base64UrlDecode(headerB64);
    const payloadJson = base64UrlDecode(payloadB64);

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    // Format dates if present
    if (payload.iat) {
      (payload as Record<string, unknown>)._iat_readable = new Date((payload.iat as number) * 1000).toISOString();
    }
    if (payload.exp) {
      (payload as Record<string, unknown>)._exp_readable = new Date((payload.exp as number) * 1000).toISOString();
      const isExpired = Date.now() > (payload.exp as number) * 1000;
      (payload as Record<string, unknown>)._expired = isExpired;
    }
    if (payload.nbf) {
      (payload as Record<string, unknown>)._nbf_readable = new Date((payload.nbf as number) * 1000).toISOString();
    }

    const result = {
      header,
      payload,
      signature: signatureB64,
    };

    return {
      data: JSON.stringify(result, null, 2),
    };
  } catch (e) {
    return { data: '', error: `Failed to decode JWT: ${e instanceof Error ? e.message : String(e)}` };
  }
}