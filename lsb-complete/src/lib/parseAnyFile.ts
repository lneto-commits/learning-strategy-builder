import * as XLSX from 'xlsx';
import { FileInput } from '../types';

export async function parseAnyFile(file: File): Promise<FileInput> {
  const name = file.name;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const sizeKb = Math.round(file.size / 1024);

  // CSV / XLSX → parse to structured rows + text
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
    return parseSpreadsheet(file, name, sizeKb);
  }

  // PDF → base64
  if (ext === 'pdf') {
    const base64 = await fileToBase64(file);
    return { name, fileType: 'pdf', base64, mediaType: 'application/pdf', sizeKb };
  }

  // Images / screenshots
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
    const base64 = await fileToBase64(file);
    const mediaType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'gif' ? 'image/gif'
      : ext === 'webp' ? 'image/webp'
      : 'image/png';
    return { name, fileType: 'image', base64, mediaType, sizeKb };
  }

  // PPTX / DOCX → extract as text (basic, browser-side)
  if (ext === 'pptx' || ext === 'docx') {
    try {
      const textContent = await extractOfficeText(file, ext);
      return { name, fileType: 'text', textContent, sizeKb };
    } catch {
      return { name, fileType: 'other', textContent: `[Binary file: ${name}]`, sizeKb };
    }
  }

  // Plain text
  if (['txt', 'md', 'json'].includes(ext)) {
    const textContent = await file.text();
    return { name, fileType: 'text', textContent: textContent.slice(0, 50000), sizeKb };
  }

  // Fallback
  return { name, fileType: 'other', textContent: `[File: ${name} (${sizeKb}KB)]`, sizeKb };
}

async function parseSpreadsheet(file: File, name: string, sizeKb: number): Promise<FileInput> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  // Convert to string records, cap at 200 rows
  const rows: Record<string, string>[] = rawRows.slice(0, 200).map(r =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [String(k), String(v ?? '')]))
  );

  // Build text summary
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const textContent = [
    `[SPREADSHEET: ${name}]`,
    `Columns: ${headers.join(', ')}`,
    `Rows: ${rows.length}`,
    '',
    ...rows.slice(0, 150).map((r, i) =>
      `${i + 1}. ${headers.map(h => `${h}: ${r[h] || '(blank)'}`).join(' | ')}`
    ),
  ].join('\n');

  return { name, fileType: 'spreadsheet-data', textContent, rows, sizeKb };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractOfficeText(file: File, ext: string): Promise<string> {
  // For DOCX: use mammoth
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return `[DOCUMENT: ${file.name}]\n${result.value.slice(0, 30000)}`;
  }

  // For PPTX: basic zip-based text extraction
  if (ext === 'pptx') {
    // PPTX is a zip — extract slide XML text as best-effort
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const texts: string[] = [`[PRESENTATION: ${file.name}]`];

    const slideFiles = Object.keys(zip.files)
      .filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'))
      .sort();

    for (const slideFile of slideFiles.slice(0, 50)) {
      const content = await zip.files[slideFile].async('string');
      // Extract text content from XML tags
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      const slideText = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
      if (slideText.trim()) {
        texts.push(`Slide: ${slideText.slice(0, 500)}`);
      }
    }
    return texts.join('\n').slice(0, 30000);
  }

  throw new Error('Unsupported office format');
}
