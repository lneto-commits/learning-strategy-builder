import * as XLSX from 'xlsx';

export type ColumnRole = 'ignore' | 'title' | 'description' | 'skills' | 'audience' | 'level' | 'other';

export interface ParsedReport {
  headers: string[];
  rows: Record<string, string>[];
}

export interface AnalyzedColumn {
  name: string;
  role: ColumnRole;
}

export interface AnalysisReport {
  columns: AnalyzedColumn[];
  rows: Record<string, string>[];
}

/**
 * Parse a CSV or XLSX file into its raw headers and rows. No column is
 * interpreted or dropped here — the user decides which columns matter and
 * what each represents in the UI.
 */
export async function parseReport(file: File): Promise<ParsedReport> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { headers: [], rows: [] };

  const sheet = workbook.Sheets[firstSheetName];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  if (aoa.length === 0) return { headers: [], rows: [] };

  const headers = (aoa[0] as unknown[]).map(h => String(h ?? '').trim()).filter(Boolean);
  if (headers.length === 0) return { headers: [], rows: [] };

  const rows = aoa
    .slice(1)
    .map(arr => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        const val = (arr as unknown[])[i];
        row[h] = val != null ? String(val).trim() : '';
      });
      return row;
    })
    .filter(row => headers.some(h => row[h] !== ''));

  return { headers, rows };
}

/** Best-effort default role for a column based on its header name. */
export function guessRole(header: string): ColumnRole {
  const h = header.toLowerCase();
  if (/(^|[^a-z])(title|name|pathway|course|content|program)([^a-z]|$)/.test(h)) return 'title';
  if (/(desc|summary|overview|detail|abstract)/.test(h)) return 'description';
  if (/(skill|tag|competenc|capabilit)/.test(h)) return 'skills';
  if (/(audience|role|persona|department|function|team)/.test(h)) return 'audience';
  if (/(level|proficiency|difficulty|seniority)/.test(h)) return 'level';
  return 'ignore';
}
