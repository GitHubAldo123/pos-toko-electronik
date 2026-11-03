/**
 * Export utilities for reports, products, and receipts
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // UTF-8 BOM so Excel opens accented & special chars cleanly
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.map(escapeCSVField).join(';'),
      ...rows.map((row) => row.map(escapeCSVField).join(';')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVField(field: string | number): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
